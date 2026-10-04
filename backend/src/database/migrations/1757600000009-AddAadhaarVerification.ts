import { MigrationInterface, QueryRunner } from 'typeorm';

// Adds the 'aadhaar' verification type (driver-onboarding step 5, optional)
// and a consent_given_at column — Aadhaar submission requires an explicit
// consent checkbox, and the DPDP Act requires that consent be captured at
// submission time, not implied. The raw Aadhaar number is never stored
// (same stance as DL/RC), only the check's outcome and consent timestamp.
export class AddAadhaarVerification1757600000009
  implements MigrationInterface
{
  name = 'AddAadhaarVerification1757600000009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE "verification_records_type_enum" ADD VALUE 'aadhaar';
    `);
    await queryRunner.query(`
      ALTER TABLE "verification_records"
        ADD COLUMN "consent_given_at" timestamptz;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Postgres has no ALTER TYPE ... DROP VALUE; reverting the enum value
    // would require rebuilding the type. Not attempted here — down() drops
    // only what it safely can.
    await queryRunner.query(`
      ALTER TABLE "verification_records" DROP COLUMN "consent_given_at";
    `);
  }
}
