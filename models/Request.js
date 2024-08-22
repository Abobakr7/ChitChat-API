const mongoose = require("mongoose");
const { Schema } = mongoose;

const requestSchema = new Schema(
    {
        requester: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        requestee: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

const Request = mongoose.model("Request", requestSchema);
module.exports = Request;
