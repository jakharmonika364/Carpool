import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({ example: '+919876543210' })
  @Matches(/^\+[1-9]\d{7,14}$/, {
    message: 'phoneNumber must be a valid phone number in E.164 format.',
  })
  phoneNumber: string;

  @ApiProperty({ example: '123456' })
  @Matches(/^\d{6}$/, { message: 'code must be a 6-digit numeric string.' })
  code: string;
}
