import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRideRequestsTable1757600000004 implements MigrationInterface {
  name = 'CreateRideRequestsTable1757600000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "ride_requests_status_enum" AS ENUM (
        'pending', 'accepted', 'declined', 'cancelled', 'expired'
      );
    `);
    await queryRunner.query(`
      CREATE TABLE "ride_requests" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "ride_id" uuid NOT NULL REFERENCES "rides" ("id") ON DELETE CASCADE,
        "rider_id" uuid NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
        "status" "ride_requests_status_enum" NOT NULL DEFAULT 'pending',
        "requested_at" timestamptz NOT NULL DEFAULT now(),
        "responded_at" timestamptz
      );
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_ride_requests_ride_id" ON "ride_requests" ("ride_id");
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_ride_requests_rider_id" ON "ride_requests" ("rider_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "ride_requests";`);
    await queryRunner.query(`DROP TYPE "ride_requests_status_enum";`);
  }
}
