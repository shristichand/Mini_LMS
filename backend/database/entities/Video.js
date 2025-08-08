const { EntitySchema } = require("typeorm");

const Video = new EntitySchema({
    name: "Video",
    tableName: "videos",
    columns: {
        id: { type: Number, primary: true, generated: true },
        title: { type: String },
        url: { type: String }, // YouTube or dummy video URL
        duration: { type: Number }, // duration in seconds
        createdAt: { type: "timestamp", createDate: true },
        updatedAt: { type: "timestamp", updateDate: true },
    },
    relations: {
        course: {
            target: "Course",
            type: "many-to-one",
            joinColumn: true,
            nullable: false,
        },
        progressRecords: {
            target: "Progress",
            type: "one-to-many",
            inverseSide: "video",
        },
    },
});

module.exports = Video;