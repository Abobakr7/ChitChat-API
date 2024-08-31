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
const io = require("socket.io")(server);

// connect to MongoDB and Redis
MongoConnect();
RedisConnect();

app.use(cors());

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

    socket.on("connection", async (userId) => {
        socket.userId = userId;
        await setOnlineUser(userId, socket.id);
    });

    socket.on("sendMessage", async (data) => {
        const { receiverId, message } = data;
        const receiverSocketId = await getOnlineUser(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("message", {
                senderId: data.senderId,
                message,
            });
        }
    });

    socket.on("disconnect", async () => {
        await removeOnlineUser(socket.userId);
    });
});

// global error handler
app.use(globalErrorHandler);

module.exports = server;
