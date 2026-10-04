import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Vehicle } from './entities/vehicle.entity';
import { Ride } from './entities/ride.entity';
import { RideRequest } from './entities/ride-request.entity';
import { VerificationRecord } from './entities/verification-record.entity';
import { resolveDatabaseSsl } from './ssl';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        ssl: resolveDatabaseSsl(
          configService.get<string>('DATABASE_URL'),
          configService.get<string>('DB_SSL'),
        ),
        entities: [User, Vehicle, Ride, RideRequest, VerificationRecord],
        // Schema is owned by migrations (run separately via the TypeORM CLI and
        // `AppDataSource`, see data-source.ts), never by app-boot synchronization.
        synchronize: false,
        autoLoadEntities: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
