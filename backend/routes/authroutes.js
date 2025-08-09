const express = require("express");
const router = express.Router();
const {
    signup,
    login,
    logout,
    getCurrentUser,
    refreshToken,
    getUsersWithProgress,
} = require("../controllers/authController");
const { jwtMiddleware, adminOnly } = require("../middlewares/jwtMiddleware");
const {
    signupValidator,
    loginValidator,
} = require("../middlewares/validator")

router.post("/signup", signupValidator, signup);
router.post("/login", loginValidator, login);
router.post("/logout", logout);
router.get("/me", jwtMiddleware, getCurrentUser);
router.post("/refresh", refreshToken);

// Admin analytics
router.get("/admin/users-with-progress", jwtMiddleware, adminOnly, getUsersWithProgress);

module.exports = router;
