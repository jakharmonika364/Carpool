import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Vehicle } from './vehicle.entity';
import { RideRequest } from './ride-request.entity';

export enum RideStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  FULL = 'full',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// Placeholder entity for future ride creation and matching work (out of scope for Month 1).
@Entity('rides')
export class Ride {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'driver_id', type: 'uuid' })
  driverId: string;

  @ManyToOne(() => User, (user) => user.rides, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'driver_id' })
  driver: Relation<User>;

  @Column({ name: 'vehicle_id', type: 'uuid', nullable: true })
  vehicleId: string | null;

  @ManyToOne(() => Vehicle, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Relation<Vehicle> | null;

  @Column({ name: 'pickup_address', type: 'varchar' })
  pickupAddress: string;

  @Column({
    name: 'pickup_point',
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  pickupPoint: string;

  @Column({ name: 'destination_address', type: 'varchar' })
  destinationAddress: string;

  @Column({
    name: 'destination_point',
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  destinationPoint: string;

  @Column({ name: 'departure_at', type: 'timestamptz' })
  departureAt: Date;

  @Column({ name: 'total_seats', type: 'int' })
  totalSeats: number;

  @Column({ name: 'available_seats', type: 'int' })
  availableSeats: number;

  @Column({
    type: 'enum',
    enum: RideStatus,
    default: RideStatus.DRAFT,
  })
  status: RideStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => RideRequest, (rideRequest) => rideRequest.ride)
  rideRequests: Relation<RideRequest>[];
}
