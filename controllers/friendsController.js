const User = require("../models/User");
const Request = require("../models/Request");
const ApiError = require("../utils/error/ApiError");
const asyncHandler = require("../utils/error/asyncHandler");

/**
 * @desc    Get friends and can search them by their name or username
 * @route   GET /api/v1/friends
 * @access  Private
 */
exports.getFriends = asyncHandler(async (req, res) => {
    const { searchQuery } = req.query;
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const count = await User.countDocuments({
        _id: { $in: req.user.friends },
        $or: [
            { name: { $regex: searchQuery, $options: "i" } },
            { username: { $regex: searchQuery, $options: "i" } },
        ],
    });
    const totalPages = Math.ceil(count / limit);

    await req.user.populate({
        path: "friends",
        match: {
            $or: [
                { name: { $regex: searchQuery, $options: "i" } },
                { username: { $regex: searchQuery, $options: "i" } },
            ],
        },
        select: "-password -__v -friends -email -updatedAt -resetPasswordToken",
        options: {
            limit,
            skip,
        },
    });
    res.status(200).json({
        status: "success",
        totalPages,
        friends: req.user.friends,
    });
});

/**
 * @desc    Send a friend request (add a friend)
 * @route   POST /api/v1/friends/:id
 * @access  Private
 */
exports.addFriend = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const friend = await User.findById(id);
    if (!friend) {
        throw new ApiError(404, "User not found");
    }
    if (req.user.friends.includes(id)) {
        throw new ApiError(400, "User is already a friend");
    }
    const friendRequest = await Request.findOne({
        requester: req.user._id,
        requestee: id,
    });
    if (friendRequest) {
        throw new ApiError(400, "A friend request has already been sent");
    }
    const newRequest = await Request.create({
        requester: req.user._id,
        requestee: id,
    });
    res.status(200).json({ status: "success" });
});

/**
 * @desc    Remove a friend
 * @route   DELETE /api/v1/friends/:id
 * @access  Private
 */
exports.removeFriend = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const friend = await User.findById(id);
    if (!friend) {
        throw new ApiError(404, "User not found");
    }
    if (
        !req.user.friends.includes(id) ||
        !friend.friends.includes(req.user._id)
    ) {
        throw new ApiError(400, "User is not a friend");
    }
    req.user.friends.pull(id);
    await req.user.save();
    friend.friends.pull(req.user._id);
    await friend.save();
    res.status(200).json({ status: "success" });
});

/**
 * @desc    Get list of friend requests
 * @route   GET /api/v1/friends/requests
 * @access  Private
 */
exports.getFriendsRequests = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    const count = await Request.countDocuments({
        requestee: req.user._id,
    });
    const totalPages = Math.ceil(count / limit);
    const requests = await Request.find({ requestee: req.user._id })
        .populate("requester", "-password -__v -friends -email -updatedAt")
        .select("-requestee -updatedAt -__v")
        .skip(skip)
        .limit(limit);
    res.status(200).json({
        status: "success",
        totalPages,
        requests: requests,
    });
});

/**
 * @desc    Accept a friend request
 * @route   POST /api/v1/friends/requests/:id/accept
 * @access  Private
 */
exports.acceptFriendRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const request = await Request.findByIdAndDelete(id);
    if (!request) {
        throw new ApiError(404, "Request not found");
    }
    if (request.requestee.toString() !== req.user._id.toString()) {
        throw new ApiError(400, "You can't accept your own request");
    }
    if (req.user.friends.includes(request.requester)) {
        throw new ApiError(400, "User is already a friend");
    }
    req.user.friends.push(request.requester);
    await req.user.save();
    await User.findByIdAndUpdate(request.requester, {
        $push: { friends: req.user._id },
    });
    res.status(200).json({ status: "success" });
});

/**
 * @desc    Decline a friend request
 * @route   DELETE /api/v1/friends/requests/:id/decline
 * @access  Private
 */
exports.declineFriendRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const request = await Request.findByIdAndDelete(id);
    if (!request) {
        throw new ApiError(404, "Request not found");
    }
    if (request.requestee.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can't decline your own request");
    }
    res.status(200).json({ status: "success" });
});
