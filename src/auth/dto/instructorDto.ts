import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength, ValidateNested } from 'class-validator';

export class SocialLinksDto {
  @IsOptional()
  @IsUrl()
  linkedin?: string;

  @IsOptional()
  @IsUrl()
  github?: string;

  @IsOptional()
  @IsUrl()
  youtube?: string;

  @IsOptional()
  @IsUrl()
  website?: string;
}

export class InstructorRequestDto {
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @MaxLength(200)
  expertise!: string;

  @IsString()
  @MaxLength(1000)
  bio?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1500)
  experience!: string;

  @IsString()
  @MaxLength(1500)
  @IsNotEmpty()
  reason!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SocialLinksDto)
  socialLinks?: SocialLinksDto;
}
