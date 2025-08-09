require("dotenv").config();
const { DataSource } = require("typeorm");
const Course = require("./entities/Course");
const User = require("./entities/User");
const Video = require("./entities/Video");
const Progress = require("./entities/Progress");
const Lesson = require("./entities/Lesson");

const Connection = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    synchronize: false,
    logging: true,
    entities: [Course, User, Video, Progress, Lesson],
    migrations: ["database/migration/**/*.js"],
});

module.exports = Connection;
