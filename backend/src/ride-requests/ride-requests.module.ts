import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RideRequest } from '../database/entities/ride-request.entity';
import { RideRequestsController } from './ride-requests.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([RideRequest]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [RideRequestsController],
})
export class RideRequestsModule {}
