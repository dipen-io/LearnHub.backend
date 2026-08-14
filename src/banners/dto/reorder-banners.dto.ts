import { IsArray, ValidateNested, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

class BannerOrderItem {
    @IsString()
    id: string;

    @IsInt()
    priority: number;
}

export class ReorderBannersDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BannerOrderItem)
    items: BannerOrderItem[];
}