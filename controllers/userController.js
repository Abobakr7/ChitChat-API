const User = require("../models/User");
const ApiError = require("../utils/error/ApiError");
const asyncHandler = require("../utils/error/asyncHandler");
const sanitizeUser = require("../utils/sanitizeUser");

/**
 * @desc    Get user profile
 * @route   GET /api/v1/users/me
 * @access  Private
 */
exports.getProfile = asyncHandler(async (req, res) => {
    res.status(200).json({ status: "success", user: sanitizeUser(req.user) });
});

/**
 * @desc    Update user profile
 * @route   PATCH /api/v1/users/me
 * @access  Private
 */
exports.updateProfile = asyncHandler(async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "email", "username"];
    const isValidOperation = updates.every((update) =>
        allowedUpdates.includes(update)
    );
    if (!isValidOperation) {
        throw new ApiError(400, "Invalid updates!");
    }
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    res.status(200).json({ status: "success", user: sanitizeUser(req.user) });
});

/**
 * @desc    Get a user profile
 * @route   GET /api/v1/users/:id
 * @access  Private
 */
exports.getUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(200).json({ status: "success", user: sanitizeUser(user) });
});

/**
 * @desc    Search users by their names
 * @route   GET /api/v1/users/search
 * @access  Private
 */
exports.searchUsers = asyncHandler(async (req, res) => {
    const { name } = req.query;
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const users = await User.find({ name: { $regex: name, $options: "i" } })
        .limit(limit)
        .skip(skip)
        .select(
            "-password -__v -friends -email -updatedAt -resetPasswordToken"
        );
    if (!users) {
        throw new ApiError(404, "No users were found");
    }
    res.status(200).json({
        status: "success",
        length: users.length,
        users,
    });
});
