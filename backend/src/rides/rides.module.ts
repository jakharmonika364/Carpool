import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ride } from '../database/entities/ride.entity';
import { RidesController } from './rides.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Ride])],
  controllers: [RidesController],
})
export class RidesModule {}
