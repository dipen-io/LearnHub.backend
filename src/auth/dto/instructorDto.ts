import { IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

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
  @IsUrl()
  portfolioUrl?: string;

  @IsOptional()
  @IsUrl()
  linkedinUrl?: string;
}
