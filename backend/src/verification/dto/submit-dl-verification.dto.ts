import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, Matches } from 'class-validator';

export class SubmitDlVerificationDto {
  @ApiProperty({ example: 'DL1420180049281' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.replace(/[\s-]/g, '').toUpperCase() : value,
  )
  @Matches(/^[A-Z]{2}[0-9A-Z]{8,15}$/, {
    message:
      'dlNumber must look like a driving licence number, e.g. DL1420180049281.',
  })
  dlNumber: string;

  @ApiProperty({ example: '1994-08-14', description: 'ISO 8601 date (yyyy-mm-dd).' })
  @IsDateString()
  dateOfBirth: string;
}
