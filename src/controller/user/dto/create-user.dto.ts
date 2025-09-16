import { IsString, IsEmail, IsDateString, MinLength, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Surname is required' })
  surname: string;

  @IsEmail({}, { message: 'Please provide a valid email' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @IsDateString({}, { message: 'Please provide a valid date in YYYY-MM-DD format' })
  @IsOptional()
  birthDate?: string;
}