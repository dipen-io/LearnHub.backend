// src/banners/banners.controller.ts

import { Controller, Get, Post, Param, Body, Query } from "@nestjs/common";
import { BannersService } from "./banners.service";
import { QueryBannersDto } from "./dto/query-banners.dto";
import { TrackBannerDto } from "./dto/track-banner.dto";

@Controller('banners')
export class BannersController {
    constructor(private readonly bannerService: BannersService) { }

    @Get()
    findActive(@Query() query: QueryBannersDto) {
        return this.bannerService.findActive(query)
    }

    @Post(':id/track')
    track(@Param('id') id: string, @Body() dto: TrackBannerDto) {
        return this.bannerService.track(id, dto.event);
    }

}
