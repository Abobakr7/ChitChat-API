const { createClient } = require("redis");

const REDIS_URI = process.env.NODE_ENV === "production" ?
                    process.env.REDIS_URI :
                    process.env.TEST_REDIS_URI;

const client = createClient({ url: REDIS_URI });
client.on("error", (error) => {
    console.error("Redis Client Error: ", error);
    process.kill(process.pid, "SIGTERM");
});

exports.RedisConnect = async () => {
    try {
        await client.connect();
        console.log("Connected to Redis Successfully");
    } catch (err) {
        console.error("Connection to Redis Faild");
        console.error("Warning: ", err);
        process.kill(process.pid, "SIGTERM");
    }
};

exports.RedisDisconnect = async () => {
    await client.disconnect();
    console.log("Disconnected from Redis Successfully");
};

exports.setOnlineUser = async (userId, socketId) => {
    await client.set(userId, socketId);
};

exports.getOnlineUser = async (userId) => {
    return await client.get(userId);
};

exports.removeOnlineUser = async (userId) => {
    await client.del(userId);
};
