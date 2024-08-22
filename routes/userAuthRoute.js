const {
    signup,
    login,
    logout,
    forgotPassword,
    resetPassword,
} = require("../controllers/userAuthController");
const {
    signupValidator,
    loginValidator,
    forgotPasswordValidator,
    resetPasswordValidator,
} = require("../middlewares/validation/authValidator");
const { auth } = require("../middlewares/authorization");
const upload = require("../utils/multer");
const { imageProcess } = require("../middlewares/imageHandler");
const router = require("express").Router();

router.post(
    "/signup",
    upload.single("avatar"),
    imageProcess,
    signupValidator,
    signup
);
router.post("/login", loginValidator, login);
router.post("/logout", auth, logout);
router.post("/forgot-password", forgotPasswordValidator, forgotPassword);
router.patch("/reset-password", resetPasswordValidator, resetPassword);

module.exports = router;
