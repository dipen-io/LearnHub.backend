// src/banners/banners.controller.ts

import { Controller, Get, Post, Param, Body, Query } from "@nestjs/common";
import { BannersService } from "./banners.service";
import { QueryBannersDto } from "./dto/query-banners.dto";
import { TrackBannerDto } from "./dto/track-banner.dto";

@Controller('banners')
export class BannersController {
    constructor(private readonly bannerService: BannersService) { }

    @Get()
    async findActive(@Query() query: QueryBannersDto) {
        const banners = await this.bannerService.findActive(query)

        return {
            success: true,
            statusCode: 200,
            message: 'Banner fetch successfully',
            data: banners,
        }
    }

    @Post(':id/track')
    track(@Param('id') id: string, @Body() dto: TrackBannerDto) {
        return this.bannerService.track(id, dto.event);
    }

}
