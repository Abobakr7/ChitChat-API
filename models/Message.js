const mongoose = require("mongoose");
const { Schema } = mongoose;

const messageSchema = new Schema(
    {
        sender: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Sender is required"],
        },
        conversationId: {
            type: Schema.Types.ObjectId,
            ref: "Conversation",
        },
        content: {
            type: String,
            required: [true, "Message is required"],
        },
    },
    { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
