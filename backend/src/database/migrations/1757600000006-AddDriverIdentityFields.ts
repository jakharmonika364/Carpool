import { MigrationInterface, QueryRunner } from 'typeorm';

// Adds the fields collected on the driver "Identity" onboarding step
// (first name, last name, gender) without disturbing the existing
// full_name column, which stays in sync from the app layer.
export class AddDriverIdentityFields1757600000006
  implements MigrationInterface
{
  name = 'AddDriverIdentityFields1757600000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "users_gender_enum" AS ENUM ('male', 'female', 'prefer_not_to_say');
    `);
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN "first_name" varchar,
        ADD COLUMN "last_name" varchar,
        ADD COLUMN "gender" "users_gender_enum";
    `);
    // Best-effort backfill so existing rows aren't left blank: split full_name
    // on the first space. Anything left over (or single-word names) lands in
    // first_name with last_name empty; users can correct this in-app.
    await queryRunner.query(`
      UPDATE "users"
      SET
        "first_name" = split_part("full_name", ' ', 1),
        "last_name" = NULLIF(substr("full_name", length(split_part("full_name", ' ', 1)) + 2), '')
      WHERE "first_name" IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        DROP COLUMN "first_name",
        DROP COLUMN "last_name",
        DROP COLUMN "gender";
    `);
    await queryRunner.query(`DROP TYPE "users_gender_enum";`);
  }
}
