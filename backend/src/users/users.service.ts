import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { phoneNumber } });
  }

  // Dev-mode phone/OTP signup: no password or email is collected up front,
  // both stay null until the person sets those up separately (not built).
  async findOrCreateByPhoneNumber(phoneNumber: string): Promise<User> {
    const existing = await this.findByPhoneNumber(phoneNumber);
    if (existing) {
      return existing;
    }

    const user = this.usersRepository.create({
      fullName: '',
      phoneNumber,
      email: null,
      passwordHash: null,
    });
    return this.usersRepository.save(user);
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();
  }

  async updateProfile(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (dto.phoneNumber && dto.phoneNumber !== user.phoneNumber) {
      const existing = await this.usersRepository.findOne({
        where: { phoneNumber: dto.phoneNumber },
      });
      if (existing) {
        throw new ConflictException(
          'An account with this phone number already exists.',
        );
      }
    }

    if (dto.email && dto.email !== user.email) {
      const existing = await this.usersRepository.findOne({
        where: { email: dto.email },
      });
      if (existing) {
        throw new ConflictException(
          'An account with this email address already exists.',
        );
      }
    }

    Object.assign(user, dto);

    // full_name stays the source of truth for existing call sites (auth
    // responses, ride listings); keep it derived whenever either part changes.
    if (dto.firstName || dto.lastName) {
      user.fullName = [user.firstName, user.lastName]
        .filter((part): part is string => Boolean(part))
        .join(' ');
    }

    return this.usersRepository.save(user);
  }
}
