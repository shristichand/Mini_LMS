const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const Connection = require("../database/data-source");
const User = require("../database/entities/User");
const Course = require("../database/entities/Course");
const Lesson = require("../database/entities/Lesson");
const Progress = require("../database/entities/Progress");
const { In } = require("typeorm");
const JWT_SECRET = process.env.JWT_SECRET_KEY_ACCESS || "your_jwt_secret_here";
const JWT_REFRESH_SECRET = process.env.JWT_SECRET_KEY_REFRESH || "your_jwt_refresh_secret_here";

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

        const accessToken = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: "6h" });
        const refreshToken = jwt.sign({ id: newUser.id }, JWT_REFRESH_SECRET, { expiresIn: "7d" });

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        };

        res.cookie("refreshToken", refreshToken, cookieOptions);
        res.json({
            name,
            email,
            token: accessToken,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
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
        console.log("Backend login route hit:", req.body);

        const { email, password } = req.body;
        const user = await userRepo.findOneBy({ email });
        if (!user) return res.status(401).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        const accessToken = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "6h" });
        const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: "7d" });

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        };

        res.cookie("refreshToken", refreshToken, cookieOptions);
        res.json({
            token: accessToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

async function logout(req, res) {
    const refreshToken = req.cookies.refreshToken;
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax"
    };

    // Always clear cookie first
    res.clearCookie("refreshToken", cookieOptions);

    let userId = null;
    let sessionDuration = null;

    if (refreshToken) {
        try {
            // 1. First decode without verification
            const decoded = jwt.decode(refreshToken);
            userId = decoded?.id || null;

            // 2. Calculate session duration if possible
            if (decoded?.iat) {
                sessionDuration = Math.floor((Date.now() - decoded.iat * 1000) / 1000);
            }

            // 3. Attempt verification (works for non-expired tokens)
            jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        } catch (error) {
            // Expected error for expired tokens - we already have userId from decode
            console.log('Token verification warning:', error.message);
        }
    }

    try {
        if (userId) {
            console.log(`User ${userId} logged out successfully. Session duration: ${sessionDuration}s`);
            // TODO: Add activity logging when UserActivityLog entity is available
            // await entityManager.save('UserActivityLog', {
            //     userId: userId,
            //     activityType: "logout",
            //     ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            //     userAgent: req.headers['user-agent'],
            //     sessionDuration: sessionDuration
            // });
        } else {
            console.warn('Logout without valid user ID');
        }
    } catch (logError) {
        console.error('Failed to save logout activity:', logError);
    }

    return res.status(200).json({
        message: "Logged out successfully",
        success: true
    });
}

async function getCurrentUser(req, res) {
    try {
        const userRepo = Connection.getRepository(User);
        const userId = req.user.id; // From JWT middleware

        const user = await userRepo.findOneBy({ id: userId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Return user data without sensitive information
        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ message: "Server error" });
    }
}

async function refreshToken(req, res) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({
            message: "No refresh token provided",
            success: false
        });
    }

    try {
        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        const userRepo = Connection.getRepository(User);
        const user = await userRepo.findOneBy({ id: decoded.id });

        if (!user) {
            return res.status(401).json({
                message: "Invalid token",
                success: false
            });
        }

        // Generate new access token
        const accessToken = jwt.sign(
            { id: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: "6h" }
        );

        return res.status(200).json({
            token: accessToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            success: true
        });

    } catch (error) {
        console.error("Error refreshing token:", error);
        return res.status(401).json({
            message: "Invalid or expired token",
            success: false
        });
    }
}
async function getUsersWithProgress(req, res) {
    try {
        const userRepo = Connection.getRepository(User);
        const courseRepo = Connection.getRepository(Course);
        const progressRepo = Connection.getRepository(Progress);

        const [users, courses] = await Promise.all([
            userRepo.find(),
            courseRepo.find({ relations: ["lessons", "lessons.video"] }),
        ]);

        const userIds = users.map((u) => u.id);
        const allVideoIds = courses
            .flatMap((c) => c.lessons || [])
            .map((l) => l.video?.id)
            .filter((v) => typeof v === "number");

        let progressList = [];
        if (userIds.length && allVideoIds.length) {
            progressList = await progressRepo.find({
                where: { user: { id: In(userIds) }, video: { id: In(allVideoIds) } },
                relations: ["user", "video"],
            });
        }

        // Group progress by userId then by videoId
        const userIdToVideoIdToProgress = new Map();
        for (const p of progressList) {
            const uid = p.user.id;
            const vid = p.video.id;
            if (!userIdToVideoIdToProgress.has(uid)) userIdToVideoIdToProgress.set(uid, new Map());
            userIdToVideoIdToProgress.get(uid).set(vid, p);
        }

        const result = users.map((u) => {
            let completedSum = 0;
            let totalSum = 0;
            const coursesProgress = courses.map((c) => {
                const lessons = c.lessons || [];
                const totalLessons = lessons.length;
                const progressMap = userIdToVideoIdToProgress.get(u.id) || new Map();
                const completedLessons = lessons.filter((l) => l.video?.id && progressMap.get(l.video.id)?.completed).length;
                completedSum += completedLessons;
                totalSum += totalLessons;
                const percentageCompleted = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
                return {
                    courseId: c.id,
                    title: c.title,
                    totalLessons,
                    completedLessons,
                    percentageCompleted,
                };
            });
            const overallPercentage = totalSum > 0 ? Math.round((completedSum / totalSum) * 100) : 0;
            return {
                id: u.id,
                name: u.name,
                email: u.email,
                role: u.role,
                overallPercentage,
                courses: coursesProgress,
            };
        });

        return res.json({ users: result });
    } catch (error) {
        console.error("getUsersWithProgress error:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

module.exports = {
    signup,
    login,
    logout,
    getCurrentUser,
    refreshToken,
    getUsersWithProgress
};




