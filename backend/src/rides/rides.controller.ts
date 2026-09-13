import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RidePlaceholderDto } from './dto/ride-placeholder.dto';

// Placeholder routes only. Ride creation and matching logic ship in a later month.
@ApiTags('rides')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'rides', version: '1' })
export class RidesController {
  @Get()
  @ApiOkResponse({ type: RidePlaceholderDto })
  list(): RidePlaceholderDto {
    return { message: 'Ride search is not yet implemented.', data: [] };
  }

  @Get(':rideId')
  @ApiOkResponse({ type: RidePlaceholderDto })
  getOne(@Param('rideId') rideId: string): RidePlaceholderDto {
    return {
      message: `Ride details are not yet implemented (requested id: ${rideId}).`,
      data: [],
    };
  }
}
