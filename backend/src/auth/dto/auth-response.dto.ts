import { ApiProperty } from '@nestjs/swagger';
import {
  Gender,
  UserRole,
  VerificationStatus,
} from '../../database/entities/user.entity';

export class PublicUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty({ nullable: true })
  firstName: string | null;

  @ApiProperty({ nullable: true })
  lastName: string | null;

  @ApiProperty({ enum: Gender, nullable: true })
  gender: Gender | null;

  @ApiProperty({ nullable: true })
  email: string | null;

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
