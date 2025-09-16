import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';

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
  @Exclude()
  password: string;

  @Column({ type: 'varchar', nullable: true })
  @Exclude()
  passwordResetToken?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  @Exclude()
  passwordResetExpires?: Date | null;

  @Column({ type: 'date', nullable: true })
  birthDate: string;

  @Column({ type: 'varchar', nullable: true })
  profilePicture: string;

  @CreateDateColumn()
  registerDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastAccess: Date;

  @Column({ type: 'jsonb', nullable: true })
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    language: string;
    timezone: string;
  };

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      const salt = await bcrypt.genSalt();
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  @Column({ type: 'varchar', nullable: true })
  phoneNumber: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', nullable: false, default: 'user' })
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
