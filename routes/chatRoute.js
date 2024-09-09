const {
    getConversations,
    getConversation,
    createConversation,
    deleteConversation,
    getMessages,
    sendMessage,
} = require("../controllers/chatController");
const {
    idValidator,
    createConvoValidator,
    getMessagesValidator,
    sendMessageValidator,
} = require("../middlewares/validation/chatValidator");
const { auth } = require("../middlewares/authorization");
const router = require("express").Router();

router
    .route("/conversations")
    .get(auth, getConversations)
    .post(auth, createConvoValidator, createConversation);
router
    .route("/conversations/:id")
    .get(auth, idValidator, getConversation)
    .delete(auth, idValidator, deleteConversation);
router.get(
    "/conversations/:convoId/messages",
    auth,
    getMessagesValidator,
    getMessages
);
router.post("/messages", auth, sendMessageValidator, sendMessage);

module.exports = router;
