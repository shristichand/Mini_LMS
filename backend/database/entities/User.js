const { EntitySchema } = require("typeorm");

const User = new EntitySchema({
    name: "User",
    tableName: "users",
    columns: {
        id: { type: Number, primary: true, generated: true },
        name: { type: String },
        email: { type: String, unique: true },
        passwordHash: { type: String },
        role: { type: String, default: "student" },
        createdAt: { type: "timestamp", createDate: true },
        updatedAt: { type: "timestamp", updateDate: true },
    },
    relations: {
        progressRecords: {
            target: "Progress",
            type: "one-to-many",
            inverseSide: "user",
        },
    },
});

module.exports = User