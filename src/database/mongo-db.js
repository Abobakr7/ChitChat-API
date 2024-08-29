const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

exports.MongoConnect = async () => {
    try {
        await mongoose.connect(process.env.DB_URI);
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
