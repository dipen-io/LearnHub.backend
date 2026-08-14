import { IsString, IsIn, IsOptional } from "class-validator";

export class BannerActionDto {
    @IsString()
    @IsIn(['screen', 'deeplink', 'external_url', 'tab', 'modal', 'none'])
    type: string;

    @IsString()
    @IsOptional()
    value?: string;
}