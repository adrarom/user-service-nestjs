import { Injectable, UnauthorizedException, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository, MoreThan } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RequestResetPasswordDto, ResetPasswordDto } from './dto/reset-password.dto';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = new User();
    user.name = createUserDto.name;
    user.surname = createUserDto.surname;
    user.email = createUserDto.email;
    user.password = createUserDto.password;
    
    if (createUserDto.birthDate) {
      user.birthDate = new Date(createUserDto.birthDate).toISOString().split('T')[0];
    }
    
    user.isActive = true;
    user.notifyEmail = true;
    user.notifyPush = true;
    user.notifySMS = false;
    user.role = 'user';
    
    return await this.userRepository.save(user);
  }

  findAll() {
    return this.userRepository.find();
  }

  findOne(id: string) {
    return this.userRepository.findOne({ where: { id } });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    const updateData: any = { ...updateUserDto };
    if (updateData.birthDate) {
      updateData.birthDate = new Date(updateData.birthDate).toISOString().split('T')[0];
    }
    return this.userRepository.update(id, updateData);
  }

  remove(id: string) {
    return this.userRepository.delete(id);
  }

  async login(loginDto: LoginDto): Promise<{ 
    user: Omit<User, 'password' | 'hashPassword' | 'validatePassword'>; 
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await this.userRepository.findOne({ where: { email: loginDto.email } });
    if (!user || !(await user.validatePassword(loginDto.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    
    const tokens = await this.getTokens(user.id, user.email);
    
    // Update last access
    await this.userRepository.update(user.id, { lastAccess: new Date() });
    
    // Remove sensitive data before returning
    const { password, hashPassword, validatePassword, ...result } = user as any;
    return { 
      user: result, 
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const { refreshToken } = refreshTokenDto;
      const payload = jwt.verify(
        refreshToken,
        this.configService.get<string>('JWT_REFRESH_SECRET')
      ) as { id: string; email: string };

      const user = await this.userRepository.findOne({ where: { id: payload.id } });
      if (!user) {
        throw new ForbiddenException('User not found');
      }

      const tokens = await this.getTokens(user.id, user.email);
      return tokens;
    } catch (error) {
      throw new ForbiddenException('Invalid refresh token');
    }
  }

  private async getTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      jwt.sign(
        { id: userId, email },
        this.configService.get<string>('JWT_SECRET'),
        { expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m') }
      ),
      jwt.sign(
        { id: userId, email },
        this.configService.get<string>('JWT_REFRESH_SECRET'),
        { expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d') }
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password, passwordResetToken, passwordResetExpires, ...result } = user as any;
    return result;
  }

  async updatePreferences(userId: string, updatePreferencesDto: UpdatePreferencesDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    user.preferences = {
      ...user.preferences,
      ...updatePreferencesDto
    };
    
    await this.userRepository.save(user);
    const { password, passwordResetToken, passwordResetExpires, ...result } = user as any;
    return result;
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await user.validatePassword(changePasswordDto.currentPassword);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    if (changePasswordDto.newPassword !== changePasswordDto.confirmNewPassword) {
      throw new BadRequestException('New passwords do not match');
    }

    user.password = changePasswordDto.newPassword;
    await this.userRepository.save(user);
    
    return { message: 'Password updated successfully' };
  }

  async requestPasswordReset(requestResetPasswordDto: RequestResetPasswordDto) {
    const user = await this.userRepository.findOne({ 
      where: { email: requestResetPasswordDto.email } 
    });
    
    if (!user) {
      // Don't reveal that the email doesn't exist
      return { message: 'If an account with that email exists, a password reset link has been sent' };
    }

    // Generate reset token (in a real app, you'd use crypto.randomBytes or similar)
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetTokenExpiry;
    await this.userRepository.save(user);

    // In a real app, you would send an email here with the reset token
    // await this.mailService.sendPasswordResetEmail(user.email, resetToken);

    return { message: 'If an account with that email exists, a password reset link has been sent' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.userRepository.findOne({
      where: {
        passwordResetToken: resetPasswordDto.token,
        passwordResetExpires: MoreThan(new Date())
      }
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (resetPasswordDto.newPassword !== resetPasswordDto.confirmNewPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    user.password = resetPasswordDto.newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    await this.userRepository.save(user);
    
    return { message: 'Password has been reset successfully' };
  }

  async getCurrentUser(userId: string) {
    // This is an alias for getProfile, but we might want to change what data is returned in the future
    return this.getProfile(userId);
  }

  async logout(userId: string) {
    // In a real app, you might want to invalidate the refresh token here
    return this.userRepository.update(userId, { lastAccess: new Date() });
  }
}
