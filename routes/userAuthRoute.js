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
const router = require("express").Router();

router.post("/signup", signupValidator, signup);
router.post("/login", loginValidator, login);
router.post("/logout", auth, logout);
router.post("/forgot-password", forgotPasswordValidator, forgotPassword);
router.patch("/reset-password", resetPasswordValidator, resetPassword);

module.exports = router;
