import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

// Dev-mode only: with no camera capture or face-match provider wired up,
// there is no real quality signal to decide pass/fail — the caller states
// the outcome it wants recorded. This is never meant to survive contact
// with a real provider; see VerificationService.submitLiveness().
export class SubmitLivenessDto {
  @ApiPropertyOptional({ enum: ['pass', 'fail'], default: 'pass' })
  @IsOptional()
  @IsIn(['pass', 'fail'])
  outcome?: 'pass' | 'fail';
}
