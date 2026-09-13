import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { PublicUserDto } from '../auth/dto/auth-response.dto';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { toPublicUser } from './users.mapper';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOkResponse({ type: PublicUserDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  async getMe(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<PublicUserDto> {
    const user = await this.usersService.findById(currentUser.id);
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    return toPublicUser(user);
  }

  @Patch('me')
  @ApiOkResponse({ type: PublicUserDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  async updateMe(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: UpdateUserDto,
  ): Promise<PublicUserDto> {
    const user = await this.usersService.updateProfile(currentUser.id, dto);
    return toPublicUser(user);
  }
}
