const { MongoConnect } = require("./database/mongo-db");
const {
    RedisConnect,
    setOnlineUser,
    getOnlineUser,
    removeOnlineUser,
} = require("./database/redis-db");

const { createServer } = require("http");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");
const express = require("express");

const ApiError = require("../utils/error/ApiError");
const globalErrorHandler = require("../middlewares/globalErrorHandler");
const userAuthRoute = require("../routes/userAuthRoute");
const userRoute = require("../routes/userRoute");
const friendsRoute = require("../routes/friendsRoute");
const chatRoute = require("../routes/chatRoute");

const app = express();
const server = createServer(app);
const io = require("socket.io")(server, {
    cors: {
        origin: process.env.FE_URL,
        methods: ["GET", "POST"],
        credentials: true,
    },
});

// connect to MongoDB and Redis
MongoConnect();
RedisConnect();

app.use(
    cors({
        origin: process.env.FE_URL,
        credentials: true,
    })
);

// middleware
if (process.env.NODE_ENV === "development") {
    console.log("Development Mode");
    app.use(morgan("dev"));
}
app.use(cookieParser());
app.use(express.json());

// routes
app.use("/api/v1/auth", userAuthRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/friends", friendsRoute);
app.use("/api/v1/chat", chatRoute);

app.all("*", (req, res, next) => {
    next(new ApiError(404, `Can't find ${req.method} ${req.originalUrl}`));
});

// socket.io
io.on("connection", (socket) => {
    console.log("New connection");

    socket.on("addUser", async (userId) => {
        socket.userId = userId;
        try {
            await setOnlineUser(userId, socket.id);
            console.log(`User ${userId} connected with socket ID ${socket.id}`);
        } catch (err) {
            console.log(`Error adding user ${userId} to online users`);
        }
    });

    socket.on("sendMessage", async (data) => {
        const { receiverId, message } = data;
        try {
            const receiverSocketId = await getOnlineUser(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("message", message);
            }
        } catch (err) {
            console.log(`Error sending message to user ${receiverId}`);
        }
    });

    socket.on("friendStatus", async (friendId, cb) => {
        try {
            const friendSocketId = await getOnlineUser(friendId);
            cb(friendSocketId ? true : false);
        } catch (err) {
            console.log(`Error sending friend status to user ${friendId}`);
            cb(false);
        }
    });

    socket.on("disconnect", async () => {
        try {
            console.log(`User ${socket.userId} disconnected`);
            await removeOnlineUser(socket.userId);
        } catch (err) {
            console.log(
                `Error removing user ${socket.userId} from online users`
            );
        }
    });
});

// global error handler
app.use(globalErrorHandler);

module.exports = server;
