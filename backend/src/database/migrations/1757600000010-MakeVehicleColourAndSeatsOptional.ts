import { MigrationInterface, QueryRunner } from 'typeorm';

// RC verification (driver-onboarding step 3) now creates the driver's first
// Vehicle row directly, but only collects make/model/registration number —
// colour and seat capacity aren't asked for on that screen and are left for
// a dedicated vehicle-management screen later.
export class MakeVehicleColourAndSeatsOptional1757600000010
  implements MigrationInterface
{
  name = 'MakeVehicleColourAndSeatsOptional1757600000010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "vehicles"
        ALTER COLUMN "colour" DROP NOT NULL,
        ALTER COLUMN "seat_capacity" DROP NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "vehicles"
        ALTER COLUMN "colour" SET NOT NULL,
        ALTER COLUMN "seat_capacity" SET NOT NULL;
    `);
  }
}
