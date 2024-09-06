const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcryptjs");
const ApiError = require("../utils/error/ApiError");

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
        resetPasswordToken: {
            type: String,
        },
    },
    { timestamps: true }
);

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
});

userSchema.statics.findByCredentials = async function (identifier, password) {
    const user = await User.findOne({
        $or: [{ email: identifier }, { username: identifier }],
    });
    if (!user) {
        throw new ApiError(401, "Wrong credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new ApiError(401, "Wrong credentials");
    }
    return user;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
