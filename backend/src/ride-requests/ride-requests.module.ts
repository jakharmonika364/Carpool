import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RideRequest } from '../database/entities/ride-request.entity';
import { RideRequestsController } from './ride-requests.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RideRequest])],
  controllers: [RideRequestsController],
})
export class RideRequestsModule {}
