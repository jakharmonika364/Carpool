import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { VerificationService } from './verification.service';
import { VerificationStatusDto } from './dto/verification-status.dto';
import { SubmitDlVerificationDto } from './dto/submit-dl-verification.dto';
import { SubmitRcVerificationDto } from './dto/submit-rc-verification.dto';
import { SubmitLivenessDto } from './dto/submit-liveness.dto';
import { SubmitAadhaarVerificationDto } from './dto/submit-aadhaar-verification.dto';

@ApiTags('verification')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'users/me/verification', version: '1' })
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Get()
  @ApiOkResponse({ type: VerificationStatusDto })
  getStatus(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<VerificationStatusDto> {
    return this.verificationService.getStatusForUser(currentUser.id);
  }

  @Post('dl')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: VerificationStatusDto })
  submitDl(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: SubmitDlVerificationDto,
  ): Promise<VerificationStatusDto> {
    return this.verificationService.submitDl(currentUser.id, dto);
  }

  @Post('rc')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: VerificationStatusDto })
  submitRc(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: SubmitRcVerificationDto,
  ): Promise<VerificationStatusDto> {
    return this.verificationService.submitRc(currentUser.id, dto);
  }

  @Post('liveness')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: VerificationStatusDto })
  submitLiveness(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: SubmitLivenessDto,
  ): Promise<VerificationStatusDto> {
    return this.verificationService.submitLiveness(currentUser.id, dto.outcome);
  }

  @Post('aadhaar')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: VerificationStatusDto })
  submitAadhaar(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: SubmitAadhaarVerificationDto,
  ): Promise<VerificationStatusDto> {
    return this.verificationService.submitAadhaar(currentUser.id, dto);
  }
}
