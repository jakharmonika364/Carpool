import { ApiProperty } from '@nestjs/swagger';
import { IsIn, Matches } from 'class-validator';

export class RequestOtpDto {
  @ApiProperty({ example: '+919876543210' })
  @Matches(/^\+[1-9]\d{7,14}$/, {
    message: 'phoneNumber must be a valid phone number in E.164 format.',
  })
  phoneNumber: string;

  @ApiProperty({ enum: ['sms', 'whatsapp'] })
  @IsIn(['sms', 'whatsapp'])
  channel: 'sms' | 'whatsapp';
}
