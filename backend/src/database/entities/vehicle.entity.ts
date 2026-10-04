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

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId: string;

  @ManyToOne(() => User, (user) => user.vehicles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: Relation<User>;

  @Column({ type: 'varchar' })
  make: string;

  @Column({ type: 'varchar' })
  model: string;

  // Nullable: RC verification (driver onboarding step 3) only collects
  // make/model/registration number today. Colour and seat capacity are
  // filled in later by a proper vehicle-management screen (not built yet).
  @Column({ type: 'varchar', nullable: true })
  colour: string | null;

  @Column({ name: 'registration_number', type: 'varchar' })
  registrationNumber: string;

  @Column({ name: 'seat_capacity', type: 'int', nullable: true })
  seatCapacity: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
