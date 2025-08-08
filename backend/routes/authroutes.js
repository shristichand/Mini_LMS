const express = require("express");
const router = express.Router();
const {
    signup,
    login
} = require("../controllers/authController");
const { jwtMiddleware } = require("../middlewares/jwtMiddleware");
const {
    signupValidator,
    loginValidator,
} = require("../middlewares/validator")

router.post("/signup", signupValidator, signup);
router.post("/login", loginValidator, login);

module.exports = router;
