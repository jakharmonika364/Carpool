import { ApiProperty } from '@nestjs/swagger';

// Placeholder DTO. The request/accept/decline workflow ships alongside ride matching.
export class RideRequestPlaceholderDto {
  @ApiProperty()
  message: string;

  @ApiProperty({ type: [Object] })
  data: unknown[];
}
