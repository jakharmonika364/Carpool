import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class SubmitRcVerificationDto {
  @ApiProperty({ example: 'GJ01AB1234' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.replace(/[\s-]/g, '').toUpperCase() : value,
  )
  @Matches(/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$/, {
    message:
      'registrationNumber must look like an Indian vehicle registration number, e.g. GJ01AB1234.',
  })
  registrationNumber: string;

  @ApiProperty({ example: 'Maruti Suzuki' })
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  make: string;

  @ApiProperty({ example: 'Swift' })
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  model: string;
}
