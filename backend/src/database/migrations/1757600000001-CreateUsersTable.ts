import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1757600000001 implements MigrationInterface {
  name = 'CreateUsersTable1757600000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "users_role_enum" AS ENUM ('student', 'admin');
    `);
    await queryRunner.query(`
      CREATE TYPE "users_verification_status_enum" AS ENUM ('pending', 'verified', 'suspended');
    `);
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "full_name" varchar NOT NULL,
        "email" varchar NOT NULL,
        "phone_number" varchar NOT NULL,
        "password_hash" varchar NOT NULL,
        "role" "users_role_enum" NOT NULL DEFAULT 'student',
        "verification_status" "users_verification_status_enum" NOT NULL DEFAULT 'pending',
        "profile_image_key" varchar,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "uq_users_email" ON "users" ("email");
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "uq_users_phone_number" ON "users" ("phone_number");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users";`);
    await queryRunner.query(`DROP TYPE "users_verification_status_enum";`);
    await queryRunner.query(`DROP TYPE "users_role_enum";`);
  }
}
