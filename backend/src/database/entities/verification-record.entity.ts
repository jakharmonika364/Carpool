import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum VerificationRecordType {
  DL = 'dl',
  RC = 'rc',
  LIVENESS = 'liveness',
  AADHAAR = 'aadhaar',
}

export enum VerificationRecordStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  REVIEW = 'review',
}

// One row per verification attempt (DL, RC, or liveness+face-match), kept as
// an append-style audit trail rather than a single mutable status per user.
// Backs driver-onboarding steps 2-4; not yet wired to a KYC provider.
@Entity('verification_records')
export class VerificationRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.verificationRecords, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @Column({
    type: 'enum',
    enum: VerificationRecordType,
  })
  type: VerificationRecordType;

  @Column({
    type: 'enum',
    enum: VerificationRecordStatus,
    default: VerificationRecordStatus.PENDING,
  })
  status: VerificationRecordStatus;

  @Column({ name: 'provider_ref', type: 'varchar', nullable: true })
  providerRef: string | null;

  @Column({
    name: 'confidence_score',
    type: 'numeric',
    precision: 5,
    scale: 4,
    nullable: true,
  })
  confidenceScore: string | null;

  // Set when the submission required an explicit consent capture (Aadhaar
  // today — DPDP Act: "collected only with explicit consent captured at the
  // point of submission, not bundled into a general terms acceptance").
  // Null for types that don't require it.
  @Column({ name: 'consent_given_at', type: 'timestamptz', nullable: true })
  consentGivenAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
