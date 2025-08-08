const { EntitySchema } = require("typeorm");

const Course = new EntitySchema({
    name: "Course",
    tableName: "courses",
    columns: {
        id: { type: Number, primary: true, generated: true },
        title: { type: String },
        description: { type: "text", nullable: true },
        createdAt: { type: "timestamp", createDate: true },
        updatedAt: { type: "timestamp", updateDate: true },
    },
    relations: {
        videos: {
            target: "Video",
            type: "one-to-many",
            inverseSide: "course",
            cascade: true,
        },
    },
});

module.exports = Course