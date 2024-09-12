const User = require("../models/User");
const ApiError = require("../utils/error/ApiError");
const asyncHandler = require("../utils/error/asyncHandler");
const { passwordResetEmail } = require("../utils/emails");
const sanitizeUser = require("../utils/sanitizeUser");
const jwt = require("jsonwebtoken");

/**
 * @desc    Signup a new user
 * @route   POST /api/v1/auth/signup
 * @access  Public
 */
exports.signup = asyncHandler(async (req, res) => {
    req.body.avatar = (null || undefined) ?? "/src/assets/anon.png";
    const user = await User.create(req.body);
    const token = jwt.sign(
        { _id: user._id.toString() },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );
    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(201).json({ status: "success", user: sanitizeUser(user) });
});

/**
 * @desc    Login a user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
exports.login = asyncHandler(async (req, res) => {
    const { identifier, password } = req.body;
    const user = await User.findByCredentials(identifier, password);
    const token = jwt.sign(
        { _id: user._id.toString() },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );
    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ status: "success", user: sanitizeUser(user) });
});

/**
 * @desc    Logout a user
 * @route   Post /api/v1/auth/logout
 * @access  Private
 */
exports.logout = asyncHandler(async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ status: "success" });
});

/**
 * @desc    User forgot their password
 * @route   Post /api/v1/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: "10m",
    });
    user.resetPasswordToken = resetToken;
    await user.save();

    const link =
        process.env.NODE_ENV === "development"
            ? `http://localhost:${
                  process.env.PORT || 3030
              }/api/v1/auth/reset-password?token=${resetToken}`
            : `https://chat-app.com/reset-password?token=${resetToken}`;

    await passwordResetEmail(user, link);

    res.status(200).json({ status: "success" });
});

/**
 * @desc    reset forgotten password
 * @route   Patch /api/v1/auth/reset-password
 * @access  Public
 */
exports.resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.query;
    if (!token) {
        throw new ApiError(400, "Please provide a token");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, (err) => {
        if (err) {
            throw new ApiError(401, "Invalid token");
        }
        return jwt.decode(token);
    });

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const { password } = req.body;
    if (!password) {
        throw new ApiError(400, "Please provide a new password");
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    await user.save();

    res.status(200).json({ status: "success" });
});
