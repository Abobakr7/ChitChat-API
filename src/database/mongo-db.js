const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const DB_URI = process.env.NODE_ENV === "production" ?
                        process.env.DB_URI :
                        process.env.TEST_DB_URI;
exports.MongoConnect = async () => {
    try {
        await mongoose.connect(DB_URI);
        console.log("Connected to MongoDB Successfully");
    } catch (err) {
        console.error("Connection to MongoDB Faild");
        console.error("MongoDB Error: ", err);
        process.kill(process.pid, "SIGTERM");
    }
};

exports.MongoDisconnect = async () => {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB Successfully");
};
