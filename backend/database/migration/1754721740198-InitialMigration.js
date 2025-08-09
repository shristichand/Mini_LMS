/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class InitialMigration1754721740198 {
    name = 'InitialMigration1754721740198'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "lessons" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "order" integer NOT NULL, "courseId" integer NOT NULL, "videoId" integer NOT NULL, CONSTRAINT "REL_e7c4f7aa03b1deb8a84574a395" UNIQUE ("videoId"), CONSTRAINT "PK_9b9a8d455cac672d262d7275730" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "lessons" ADD CONSTRAINT "FK_1a9ff2409a84c76560ae8a92590" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lessons" ADD CONSTRAINT "FK_e7c4f7aa03b1deb8a84574a3950" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "lessons" DROP CONSTRAINT "FK_e7c4f7aa03b1deb8a84574a3950"`);
        await queryRunner.query(`ALTER TABLE "lessons" DROP CONSTRAINT "FK_1a9ff2409a84c76560ae8a92590"`);
        await queryRunner.query(`DROP TABLE "lessons"`);
    }
}
