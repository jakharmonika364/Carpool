import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Ride } from './ride.entity';

export enum RideRequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

// Placeholder entity for future ride-request workflow (out of scope for Month 1).
@Entity('ride_requests')
export class RideRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'ride_id', type: 'uuid' })
  rideId: string;

  @ManyToOne(() => Ride, (ride) => ride.rideRequests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ride_id' })
  ride: Ride;

  @Column({ name: 'rider_id', type: 'uuid' })
  riderId: string;

  @ManyToOne(() => User, (user) => user.rideRequests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rider_id' })
  rider: User;

  @Column({
    type: 'enum',
    enum: RideRequestStatus,
    default: RideRequestStatus.PENDING,
  })
  status: RideRequestStatus;

  @CreateDateColumn({ name: 'requested_at', type: 'timestamptz' })
  requestedAt: Date;

  @Column({ name: 'responded_at', type: 'timestamptz', nullable: true })
  respondedAt: Date | null;
}
