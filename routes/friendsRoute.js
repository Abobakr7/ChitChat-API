const {
    getFriends,
    searchFriends,
    addFriend,
    removeFriend,
    getFriendsRequests,
    acceptFriendRequest,
    declineFriendRequest,
} = require("../controllers/friendsController");
const {
    idValidator,
    searchFriendValidator,
} = require("../middlewares/validation/friendsValidator");
const { auth } = require("../middlewares/authorization");
const router = require("express").Router();

router.get("/search", auth, searchFriendValidator, searchFriends);
router
    .route("/:id")
    .post(auth, idValidator, addFriend)
    .delete(auth, idValidator, removeFriend);
router.get("/requests", auth, getFriendsRequests);
router.post("/requests/:id/accept", auth, idValidator, acceptFriendRequest);
router.post("/requests/:id/decline", auth, idValidator, declineFriendRequest);

module.exports = router;
