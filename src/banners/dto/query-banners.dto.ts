import {
    IsEnum,
    IsOptional,
    IsString,
    IsIn,
} from 'class-validator';
import { BannerPosition } from '../enums/banner-position.enum';
import { BannerPlatform } from '../enums/banner-platform.enum';

export class QueryBannersDto {
    @IsEnum(BannerPosition)
    position: BannerPosition;

    @IsEnum(BannerPlatform)
    @IsOptional()
    platform?: BannerPlatform;

    @IsString()
    @IsOptional()
    version?: string;

    @IsString()
    @IsOptional()
    @IsIn(['guests', 'logged_in', 'new_users', 'returning'])
    userType?: string;
}