import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRidesTable1757600000003 implements MigrationInterface {
  name = 'CreateRidesTable1757600000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "rides_status_enum" AS ENUM (
        'draft', 'published', 'full', 'active', 'completed', 'cancelled'
      );
    `);
    await queryRunner.query(`
      CREATE TABLE "rides" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "driver_id" uuid NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
        "vehicle_id" uuid REFERENCES "vehicles" ("id") ON DELETE SET NULL,
        "pickup_address" varchar NOT NULL,
        "pickup_point" geography(Point, 4326) NOT NULL,
        "destination_address" varchar NOT NULL,
        "destination_point" geography(Point, 4326) NOT NULL,
        "departure_at" timestamptz NOT NULL,
        "total_seats" integer NOT NULL,
        "available_seats" integer NOT NULL,
        "status" "rides_status_enum" NOT NULL DEFAULT 'draft',
        "notes" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "chk_rides_total_seats_positive" CHECK ("total_seats" > 0),
        CONSTRAINT "chk_rides_available_seats_non_negative" CHECK ("available_seats" >= 0),
        CONSTRAINT "chk_rides_available_seats_within_total" CHECK ("available_seats" <= "total_seats")
      );
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_rides_driver_id" ON "rides" ("driver_id");
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_rides_departure_at" ON "rides" ("departure_at");
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_rides_status" ON "rides" ("status");
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_rides_pickup_point" ON "rides" USING GIST ("pickup_point");
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_rides_destination_point" ON "rides" USING GIST ("destination_point");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "rides";`);
    await queryRunner.query(`DROP TYPE "rides_status_enum";`);
  }
}
