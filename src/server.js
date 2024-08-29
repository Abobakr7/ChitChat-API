const { MongoDisconnect } = require("./database/mongo-db");
const { RedisDisconnect } = require("./database/redis-db");
const server = require("./app");

const PORT = process.env.PORT || 3030;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
    console.error("UNHANDLED REJECTION! Shutting down...");
    console.error(err);
    server.close(() => {
        process.exit(1);
    });
});

process.on("SIGINT", async () => {
    console.log("SIGINT RECEIVED. Shutting down...");
    try {
        await MongoDisconnect();
        await RedisDisconnect();
    } catch (err) {
        console.error("Error during shutdown");
        console.error(err);
    }
    server.close(() => {
        process.exit(0);
    });
});

process.on("SIGTERM", async () => {
    console.log("SIGTERM RECEIVED. Shutting down...");
    server.close(() => {
        process.exit(0);
    });
});
