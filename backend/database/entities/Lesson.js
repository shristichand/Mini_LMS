const { EntitySchema } = require("typeorm");

const Lesson = new EntitySchema({
  name: "Lesson",
  tableName: "lessons",
  columns: {
    id: { type: Number, primary: true, generated: true },
    title: { type: String },
    description: { type: 'text', nullable: true },
    order: { type: Number },  
  },
  relations: {
    course: {
      target: "Course",
      type: "many-to-one",
      joinColumn: true,
      nullable: false,
      inverseSide: "lessons",
    },
    video: {
      target: "Video",
      type: "one-to-one",
      joinColumn: true,
      nullable: false,
      cascade: true,
      eager: true,
    },
  },
});

module.exports = Lesson;
