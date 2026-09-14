import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ride } from '../database/entities/ride.entity';
import { RidesController } from './rides.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ride]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [RidesController],
})
export class RidesModule {}
