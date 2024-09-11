const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const ApiError = require("../utils/error/ApiError");
const asyncHandler = require("../utils/error/asyncHandler");

/**
 * @desc    Get all conversations
 * @route   GET /api/v1/chat/conversations
 * @access  Private
 */
exports.getConversations = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    const count = await Conversation.countDocuments({
        members: { $in: [req.user._id] },
    });
    const totalPages = Math.ceil(count / limit);
    const conversations = await Conversation.find({
        members: { $in: [req.user._id] },
    })
        .populate({
            path: "members",
            select: "-password -__v -friends -email -updatedAt -resetPasswordToken",
        })
        .sort({ updatedAt: -1 })
        .limit(limit)
        .skip(skip);
    res.status(200).json({
        success: "success",
        totalPages,
        conversations,
    });
});

/**
 * @desc    Get conversation by ID
 * @route   GET /api/v1/chat/conversations/:id
 * @access  Private
 */
exports.getConversation = asyncHandler(async (req, res) => {
    const conversation = await Conversation.findById(req.params.id).populate({
        path: "members",
        select: "-password -__v -friends -email -updatedAt -resetPasswordToken",
    });
    if (!conversation) {
        throw new ApiError(404, "Conversation not found");
    }
    res.status(200).json({ success: "success", conversation });
});

/**
 * @desc    Create new conversation
 * @route   POST /api/v1/chat/conversations
 * @access  Private
 */
exports.createConversation = asyncHandler(async (req, res) => {
    const { recieverId } = req.body;
    const conversation = await Conversation.findOne({
        $or: [
            { members: [req.user._id, recieverId] },
            { members: [recieverId, req.user._id] },
        ],
    });
    if (conversation) {
        return res.redirect(`/api/v1/chat/conversations/${conversation._id}`);
    }
    if (req.user._id === recieverId) {
        throw new ApiError(400, "You cannot create conversation with yourself");
    }
    if (!req.user.friends.includes(recieverId)) {
        throw new ApiError(
            400,
            "You can only create conversation with friends"
        );
    }
    const newConversation = await Conversation.create({
        members: [req.user._id, recieverId],
    });
    res.status(201).json({ success: "success", conversation: newConversation });
});

/**
 * @desc    Delete conversation
 * @route   DELETE /api/v1/chat/conversations/:id
 * @access  Private
 */
exports.deleteConversation = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const conversation = await Conversation.findByIdAndDelete(id);
    if (conversation) {
        await Message.deleteMany({ conversationId: id });
    }
    res.status(200).json({ success: "success" });
});

/**
 * @desc    Get all messages
 * @route   GET /api/v1/chat/conversations/:convoId/messages
 * @access  Private
 */
exports.getMessages = asyncHandler(async (req, res) => {
    const { convoId } = req.params;
    const limit = parseInt(req.query.limit) || 30;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    const count = await Message.countDocuments({ conversationId: convoId });
    const totalPages = Math.ceil(count / limit);
    const messages = await Message.find({ conversationId: convoId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);
    messages.reverse();
    res.status(200).json({
        status: "success",
        totalPages,
        messages,
    });
});

/**
 * @desc    Send new message
 * @route   POST /api/v1/chat/messages
 * @access  Private
 */
exports.sendMessage = asyncHandler(async (req, res) => {
    const { content, conversationId } = req.body;
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
        throw new ApiError(404, "Conversation not found");
    }
    const message = await Message.create({
        sender: req.user._id,
        conversationId,
        content,
    });
    res.status(201).json({ success: "success", message });
});
