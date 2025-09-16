import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdatePreferencesDto {
  @IsBoolean()
  @IsOptional()
  emailNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  pushNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  smsNotifications?: boolean;

  @IsString()
  @IsOptional()
  language?: string;

  @IsString()
  @IsOptional()
  timezone?: string;
}
