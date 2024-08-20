const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcryptjs");

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
        },
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: [true, "Username is already taken"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: [true, "Email is already taken"],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        status: {
            type: String,
            enum: ["online", "offline"],
        },
        lastSeen: {
            type: Date,
        },
        friends: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        avatar: {
            type: String,
        },
    },
    { timestamps: true }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 8);
    next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
