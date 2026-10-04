import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { VerificationRecord } from '../database/entities/verification-record.entity';
import { Vehicle } from '../database/entities/vehicle.entity';
import { VerificationService } from './verification.service';
import { VerificationController } from './verification.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, VerificationRecord, Vehicle]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [VerificationController],
  providers: [VerificationService],
})
export class VerificationModule {}
