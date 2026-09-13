import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RideRequestPlaceholderDto } from './dto/ride-request-placeholder.dto';

// Placeholder route only. Ride-request workflow ships in a later month.
@ApiTags('ride-requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'ride-requests', version: '1' })
export class RideRequestsController {
  @Get()
  @ApiOkResponse({ type: RideRequestPlaceholderDto })
  list(): RideRequestPlaceholderDto {
    return { message: 'Ride requests are not yet implemented.', data: [] };
  }
}
