const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const Connection = require("../database/data-source");
const User = require("../database/entities/User");
const JWT_SECRET = process.env.JWT_SECRET_KEY_ACCESS || "your_jwt_secret_here";

async function signup(req, res) {
    try {
        const userRepo = Connection.getRepository(User);
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { name, email, password } = req.body;
        const existingUser = await userRepo.findOneBy({ email });
        if (existingUser) return res.status(400).json({ message: "Email already in use" });

        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = userRepo.create({ name, email, passwordHash, role: "student" });
        await userRepo.save(newUser);

        const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: "1d" });
        res.json({ name, email, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

async function login(req, res) {
    try {
        const userRepo = Connection.getRepository(User);
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { email, password } = req.body;
        const user = await userRepo.findOneBy({ email });
        if (!user) return res.status(401).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}


module.exports = {
    signup,
    login,
};
