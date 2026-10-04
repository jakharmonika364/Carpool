import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Equals, Matches } from 'class-validator';

export class SubmitAadhaarVerificationDto {
  @ApiProperty({ example: '482910489201' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.replace(/\s/g, '') : value,
  )
  @Matches(/^\d{12}$/, { message: 'aadhaarNumber must be exactly 12 digits.' })
  aadhaarNumber: string;

  // DPDP Act: consent must be an explicit, affirmative action at submission
  // time. Only `true` is accepted — omitting it or sending `false` fails
  // validation rather than being treated as "not given".
  @ApiProperty({ example: true })
  @Equals(true, { message: 'consent must be explicitly given (true).' })
  consent: true;
}
