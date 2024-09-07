const {
    getProfile,
    updateProfile,
    updatePassword,
    searchUsers,
    getUser,
} = require("../controllers/userController");
const { auth } = require("../middlewares/authorization");
const {
    updateProfileValidator,
    updatePasswordValidator,
    getUserValidator,
    searchUsersValidator,
} = require("../middlewares/validation/userValidator");
const router = require("express").Router();

router
    .route("/me")
    .get(auth, getProfile)
    .patch(auth, updateProfileValidator, updateProfile);
router.patch("/me/password", auth, updatePasswordValidator, updatePassword);
router.get("/search", auth, searchUsersValidator, searchUsers);
router.get("/:id", auth, getUserValidator, getUser);

module.exports = router;
