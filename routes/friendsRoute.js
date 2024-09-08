const {
    getFriends,
    addFriend,
    removeFriend,
    getFriendsRequests,
    acceptFriendRequest,
    declineFriendRequest,
} = require("../controllers/friendsController");
const {
    idValidator,
    getFriendValidator,
} = require("../middlewares/validation/friendsValidator");
const { auth } = require("../middlewares/authorization");
const router = require("express").Router();

router.get("/", auth, getFriendValidator, getFriends);
router
    .route("/:id")
    .post(auth, idValidator, addFriend)
    .delete(auth, idValidator, removeFriend);
router.get("/requests", auth, getFriendsRequests);
router.post("/requests/:id/accept", auth, idValidator, acceptFriendRequest);
router.delete("/requests/:id/decline", auth, idValidator, declineFriendRequest);

module.exports = router;
