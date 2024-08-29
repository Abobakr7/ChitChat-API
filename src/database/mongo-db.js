const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

mongoose.connect(process.env.DB_URI);
mongoose.connection
    .once("open", () => {
        console.log("Connected to DB Successfully");
    })
    .on("error", (err) => {
        console.warn("Connection to DB Faild");
        console.warn("Warning: ", err);
        process.exit(1);
    });
