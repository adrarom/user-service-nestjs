import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsEmail, IsDateString, MinLength, IsOptional } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ 
    description: 'User\'s first name',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'User\'s last name',
    example: 'Doe',
  })
  @IsOptional()
  @IsString()
  surname?: string;

  @ApiPropertyOptional({
    description: 'User\'s email address',
    example: 'john.doe@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'User\'s password (min 6 characters)',
    minLength: 6,
    example: 'securePassword123',
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;
}
