import { User } from '../database/entities/user.entity';
import { PublicUserDto } from '../auth/dto/auth-response.dto';

export function toPublicUser(user: User): PublicUserDto {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    verificationStatus: user.verificationStatus,
    profileImageKey: user.profileImageKey,
  };
}
