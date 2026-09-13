import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVehiclesTable1757600000002 implements MigrationInterface {
  name = 'CreateVehiclesTable1757600000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "vehicles" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "owner_id" uuid NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
        "make" varchar NOT NULL,
        "model" varchar NOT NULL,
        "colour" varchar NOT NULL,
        "registration_number" varchar NOT NULL,
        "seat_capacity" integer NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_vehicles_owner_id" ON "vehicles" ("owner_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "vehicles";`);
  }
}
