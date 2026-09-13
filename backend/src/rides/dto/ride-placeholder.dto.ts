import { ApiProperty } from '@nestjs/swagger';

// Placeholder DTO. Full ride creation/search DTOs land alongside the ride-matching feature.
export class RidePlaceholderDto {
  @ApiProperty()
  message: string;

  @ApiProperty({ type: [Object] })
  data: unknown[];
}
