import { User } from '../database/entities/user.entity';
import { PublicUserDto } from '../auth/dto/auth-response.dto';

export function toPublicUser(user: User): PublicUserDto {
  return {
    id: user.id,
    fullName: user.fullName,
    firstName: user.firstName,
    lastName: user.lastName,
    gender: user.gender,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    verificationStatus: user.verificationStatus,
    profileImageKey: user.profileImageKey,
  };
}
