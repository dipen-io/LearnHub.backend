import {
    IsString, IsEnum, IsBoolean, IsOptional, IsIn, Min, IsArray, IsInt,

    ValidateNested, IsJSON, IsDateString
} from "class-validator";

import { Type } from "class-transformer";
import { BannerType } from "../enums/banner-type.enum";
import { BannerPosition } from "../enums/banner-position.enum";
import { BannerPlatform } from "../enums/banner-platform.enum";
import { TargetAudience } from "../enums/target-audience.enum";


export class CreateBannerDto {
    @IsString()
    name: string;

    @IsEnum(BannerType)
    type: BannerType;

    @IsEnum(BannerPosition)
    position: BannerPosition;

    @IsInt()
    @Min(0)
    @IsOptional()
    priority?: number

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @IsEnum(BannerPlatform)
    @IsOptional()
    platform?: BannerPlatform;

    @IsString()
    @IsOptional()
    appVersionMin?: string;

    @IsString()
    @IsOptional()
    appVersionMax?: string;

    @IsEnum(TargetAudience)
    @IsOptional()
    targetAudience?: TargetAudience;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    targetCategories?: string[];

    @IsDateString()
    @IsOptional()
    startAt?: string;

    @IsDateString()
    @IsOptional()
    endAt?: string;

    @IsOptional()
    content?: Record<string, any>;
}