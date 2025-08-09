/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class InitialMigration1754726846620 {
    name = 'InitialMigration1754726846620'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "courses" ADD "thumbnail" character varying`);
        await queryRunner.query(`ALTER TABLE "lessons" ADD "description" text`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "lessons" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "thumbnail"`);
    }
}
