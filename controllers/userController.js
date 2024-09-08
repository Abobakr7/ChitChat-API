const User = require("../models/User");
const Request = require("../models/Request");
const ApiError = require("../utils/error/ApiError");
const asyncHandler = require("../utils/error/asyncHandler");
const sanitizeUser = require("../utils/sanitizeUser");
const bcrypt = require("bcryptjs");

/**
 * @desc    Set friendship status
 * @param   {Object} currentUser
 * @param   {Array} users
 * @return  {Array} users after setting friendship status
 */
async function setFriendShipStatus(currentUser, users) {
    const setIsFriend = users.map((user) => {
        const isFriend = currentUser.friends.includes(user._id);
        return { ...user.toObject(), isFriend };
    });
    const setRequestSent = [];
    for await (const user of setIsFriend) {
        const request = await Request.findOne({
            $or: [
                { requester: currentUser._id, requestee: user._id },
                { requester: user._id, requestee: currentUser._id },
            ],
        });
        setRequestSent.push({ ...user, requestSent: !!request });
    }
    return setRequestSent;
}

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
    const { name, email, username } = req.body;
    const allowedUpdates = ["name", "email", "username"];
    if (!name && !email && !username) {
        throw new ApiError(400, "No updates were provided");
    }
    if (email && email !== req.user.email) {
        const user = await User.findOne({ email });
        if (user) {
            throw new ApiError(400, "Email is already in use");
        }
    }
    if (username && username !== req.user.username) {
        const user = await User.findOne({ username });
        if (user) {
            throw new ApiError(400, "Username is already in use");
        }
    }
    allowedUpdates.forEach((update) => {
        if (req.body[update]) {
            req.user[update] = req.body[update];
        }
    });
    await req.user.save();
    res.status(200).json({ status: "success", user: sanitizeUser(req.user) });
});

/**
 * @desc    Update user password
 * @route   PATCH /api/v1/users/me/password
 * @access  Private
 */
exports.updatePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const isMatch = await bcrypt.compare(oldPassword, req.user.password);
    if (!isMatch) {
        throw new ApiError(400, "Old password is incorrect");
    }
    req.user.password = newPassword;
    await req.user.save();
    res.status(200).json({ status: "success" });
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
    const { searchQuery } = req.query;
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const count = await User.countDocuments({
        $or: [
            { name: { $regex: searchQuery, $options: "i" } },
            { username: { $regex: searchQuery, $options: "i" } },
        ],
        _id: { $ne: req.user._id },
    });
    const totalPages = Math.ceil(count / limit);

    const users = await User.find({
        $or: [
            { name: { $regex: searchQuery, $options: "i" } },
            { username: { $regex: searchQuery, $options: "i" } },
        ],
        _id: { $ne: req.user._id },
    })
        .limit(limit)
        .skip(skip)
        .select("-password -__v -email -updatedAt -resetPasswordToken");
    if (!users || users.length === 0) {
        throw new ApiError(404, "No users were found");
    }
    const updatedUsers = await setFriendShipStatus(req.user, users);

    res.status(200).json({
        status: "success",
        totalPages,
        users: updatedUsers,
    });
});
