import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicle } from '../database/entities/vehicle.entity';
import { VehiclesController } from './vehicles.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vehicle]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [VehiclesController],
})
export class VehiclesModule {}
