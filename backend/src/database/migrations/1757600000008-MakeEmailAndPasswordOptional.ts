import { MigrationInterface, QueryRunner } from 'typeorm';

// Phone/OTP signup (the mobile app's only working signup path today) has
// neither an email nor a password at creation time — both are collected,
// if ever, once the person also sets up email/password login. The unique
// index on email is untouched: Postgres allows any number of NULLs in it.
export class MakeEmailAndPasswordOptional1757600000008
  implements MigrationInterface
{
  name = 'MakeEmailAndPasswordOptional1757600000008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        ALTER COLUMN "email" DROP NOT NULL,
        ALTER COLUMN "password_hash" DROP NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        ALTER COLUMN "email" SET NOT NULL,
        ALTER COLUMN "password_hash" SET NOT NULL;
    `);
  }
}
