import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Vehicle } from './vehicle.entity';
import { Ride } from './ride.entity';
import { RideRequest } from './ride-request.entity';
import { VerificationRecord } from './verification-record.entity';

export enum UserRole {
  STUDENT = 'student',
  ADMIN = 'admin',
}

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  SUSPENDED = 'suspended',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'full_name', type: 'varchar' })
  fullName: string;

  @Column({ name: 'first_name', type: 'varchar', nullable: true })
  firstName: string | null;

  @Column({ name: 'last_name', type: 'varchar', nullable: true })
  lastName: string | null;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender: Gender | null;

  // Nullable: a phone/OTP signup has neither until the person also sets up
  // email/password login (not built yet — see users.service.ts).
  @Column({ type: 'varchar', unique: true, nullable: true })
  email: string | null;

  @Column({ name: 'phone_number', type: 'varchar', unique: true })
  phoneNumber: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    select: false,
    nullable: true,
  })
  passwordHash: string | null;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  role: UserRole;

  @Column({
    name: 'verification_status',
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  verificationStatus: VerificationStatus;

  @Column({ name: 'profile_image_key', type: 'varchar', nullable: true })
  profileImageKey: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => Vehicle, (vehicle) => vehicle.owner)
  vehicles: Relation<Vehicle>[];

  @OneToMany(() => Ride, (ride) => ride.driver)
  rides: Relation<Ride>[];

  @OneToMany(() => RideRequest, (rideRequest) => rideRequest.rider)
  rideRequests: Relation<RideRequest>[];

  @OneToMany(() => VerificationRecord, (record) => record.user)
  verificationRecords: Relation<VerificationRecord>[];
}
