import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString} from 'class-validator';

export class InstructorRequestDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  expertise: string[];

  @IsObject()
  @IsNotEmpty()
  socialLinks: Record<string, string>;

  @IsString()
  @IsNotEmpty()
  channelName: string[];

  @IsObject()
  @IsNotEmpty()
  paymentDetails: Record<string, any>;

  @IsOptional()
  @IsString()
  channelThumbnail?: string;
}
