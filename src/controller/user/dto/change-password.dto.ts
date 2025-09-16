import { IsString, IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password too weak. It must contain at least 1 uppercase, 1 lowercase, 1 number or special character',
  })
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  confirmNewPassword: string;
}
