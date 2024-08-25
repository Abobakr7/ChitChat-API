const {
    getProfile,
    updateProfile,
    searchUsers,
    getUser,
} = require("../controllers/userController");
const { auth } = require("../middlewares/authorization");
const {
    updateProfileValidator,
    getUserValidator,
    searchUsersValidator,
} = require("../middlewares/validation/userValidator");
const router = require("express").Router();

router
    .route("/me")
    .get(auth, getProfile)
    .put(auth, updateProfileValidator, updateProfile);
router.get("/search", auth, searchUsersValidator, searchUsers);
router.get("/:id", auth, getUserValidator, getUser);

module.exports = router;
