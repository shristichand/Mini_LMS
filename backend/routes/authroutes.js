const express = require("express");
const router = express.Router();
const {
    signup,
    login,
    logout,
    getCurrentUser,
    refreshToken
} = require("../controllers/authController");
const { jwtMiddleware } = require("../middlewares/jwtMiddleware");
const {
    signupValidator,
    loginValidator,
} = require("../middlewares/validator")

router.post("/signup", signupValidator, signup);
router.post("/login", loginValidator, login);
router.post("/logout", logout);
router.get("/me", jwtMiddleware, getCurrentUser);
router.post("/refresh", refreshToken);

module.exports = router;
