const { EntitySchema } = require("typeorm");

const Progress = new EntitySchema({
    name: "Progress",
    tableName: "progress",
    columns: {
        id: { type: Number, primary: true, generated: true },
        watchedDuration: { type: Number, default: 0 }, // seconds watched
        completed: { type: Boolean, default: false },
        updatedAt: { type: "timestamp", updateDate: true },
    },
    relations: {
        user: {
            target: "User",
            type: "many-to-one",
            joinColumn: true,
            nullable: false,
        },
        video: {
            target: "Video",
            type: "many-to-one",
            joinColumn: true,
            nullable: false,
        },
    },
    indices: [
        {
            name: "IDX_USER_VIDEO",
            columns: ["user", "video"],
            unique: true, // Each user-video pair has one progress record
        },
    ],
});

module.exports = Progress