import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'varchar', nullable: false })
  surname: string;

  @Column({ type: 'varchar', nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: false })
  password: string;

  @Column({ type: 'date', nullable: false })
  birthDate: Date;

  @Column({ type: 'varchar', nullable: true })
  profilePicture: string;

  @CreateDateColumn()
  registerDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastAccess: Date;

  @Column({ type: 'varchar', nullable: true })
  phoneNumber: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', nullable: false })
  role: string;

  @Column({ type: 'varchar', nullable: true })
  address: string;

  @Column({ type: 'varchar', nullable: true })
  city: string;

  @Column({ type: 'varchar', nullable: true })
  province: string;

  @Column({ type: 'varchar', nullable: true })
  country: string;

  @Column({ type: 'varchar', nullable: true })
  zipCode: string;

  @Column({ type: 'boolean', default: true })
  notifyEmail: boolean;
  
  @Column({ type: 'boolean', default: true })
  notifyPush: boolean;

  @Column({ type: 'boolean', default: false })
  notifySMS: boolean;

  @UpdateDateColumn()
  updatedAt: Date;
}
