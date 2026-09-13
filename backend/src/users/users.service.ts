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

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();
  }

  async createStudent(data: {
    fullName: string;
    email: string;
    phoneNumber: string;
    passwordHash: string;
  }): Promise<User> {
    const existing = await this.usersRepository.findOne({
      where: [{ email: data.email }, { phoneNumber: data.phoneNumber }],
    });
    if (existing) {
      throw new ConflictException(
        existing.email === data.email
          ? 'An account with this email already exists.'
          : 'An account with this phone number already exists.',
      );
    }

    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
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

    Object.assign(user, dto);
    return this.usersRepository.save(user);
  }
}
