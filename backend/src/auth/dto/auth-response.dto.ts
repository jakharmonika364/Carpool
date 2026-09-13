import { ApiProperty } from '@nestjs/swagger';
import {
  UserRole,
  VerificationStatus,
} from '../../database/entities/user.entity';

export class PublicUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty({ enum: VerificationStatus })
  verificationStatus: VerificationStatus;

  @ApiProperty({ nullable: true })
  profileImageKey: string | null;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty({ type: PublicUserDto })
  user: PublicUserDto;
}
