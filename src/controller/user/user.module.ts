import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthModule } from '../../auth/auth.module';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule,
    AuthModule,
  ],
  exports: [UserService],
})
export class UserModule {}
