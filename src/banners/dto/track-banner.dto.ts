import { IsString, IsIn } from 'class-validator';

export class TrackBannerDto {
    @IsString()
    @IsIn(['impression', 'click'])
    event: 'impression' | 'click';
}