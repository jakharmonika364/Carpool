import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './entities/user.entity';
import { Vehicle } from './entities/vehicle.entity';
import { Ride } from './entities/ride.entity';
import { RideRequest } from './entities/ride-request.entity';
import { VerificationRecord } from './entities/verification-record.entity';
import { resolveDatabaseSsl } from './ssl';

config();

// Used by the TypeORM CLI to generate/run/revert migrations outside of Nest's DI context.
export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: resolveDatabaseSsl(process.env.DATABASE_URL, process.env.DB_SSL),
  entities: [User, Vehicle, Ride, RideRequest, VerificationRecord],
  // Resolves to src/database/migrations/*.ts under ts-node and dist/database/migrations/*.js when compiled.
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  synchronize: false,
});
