import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

// Placeholder route only. Vehicle CRUD is out of scope for Month 1.
@ApiTags('vehicles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'vehicles', version: '1' })
export class VehiclesController {
  @Get()
  @ApiOkResponse({
    description:
      'Placeholder endpoint. Vehicle management ships in a later month.',
  })
  list(): { message: string; data: [] } {
    return { message: 'Vehicle management is not yet implemented.', data: [] };
  }
}
