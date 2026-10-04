import { MigrationInterface, QueryRunner } from 'typeorm';

// Backs the remaining driver-onboarding steps (DL, RC, liveness selfie): one
// row per check attempt, so a rejected/expired attempt stays in the audit
// trail instead of being overwritten. See docs/getting-started or the PRD's
// Database Design section for the full field rationale.
export class CreateVerificationRecordsTable1757600000007
  implements MigrationInterface
{
  name = 'CreateVerificationRecordsTable1757600000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "verification_records_type_enum" AS ENUM ('dl', 'rc', 'liveness');
    `);
    await queryRunner.query(`
      CREATE TYPE "verification_records_status_enum" AS ENUM ('pending', 'verified', 'rejected', 'review');
    `);
    await queryRunner.query(`
      CREATE TABLE "verification_records" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
        "type" "verification_records_type_enum" NOT NULL,
        "status" "verification_records_status_enum" NOT NULL DEFAULT 'pending',
        "provider_ref" varchar,
        "confidence_score" numeric(5,4),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_verification_records_user_id" ON "verification_records" ("user_id");
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_verification_records_user_id_type" ON "verification_records" ("user_id", "type");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "verification_records";`);
    await queryRunner.query(`DROP TYPE "verification_records_status_enum";`);
    await queryRunner.query(`DROP TYPE "verification_records_type_enum";`);
  }
}
