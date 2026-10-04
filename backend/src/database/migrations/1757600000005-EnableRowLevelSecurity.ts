import { MigrationInterface, QueryRunner } from 'typeorm';

const TABLES = ['users', 'vehicles', 'rides', 'ride_requests'];

// Supabase exposes public-schema tables through its REST API using the anon key.
// Enabling RLS with no policies blocks that path; the NestJS API connects as the
// table owner (postgres), which bypasses RLS, so it is unaffected.
export class EnableRowLevelSecurity1757600000005 implements MigrationInterface {
  name = 'EnableRowLevelSecurity1757600000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const table of TABLES) {
      await queryRunner.query(
        `ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of TABLES) {
      await queryRunner.query(
        `ALTER TABLE "${table}" DISABLE ROW LEVEL SECURITY;`,
      );
    }
  }
}
