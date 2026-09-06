//src/banners/admin-banners.controller.ts

import { Patch, Delete, Controller, Get, Post, Body, Param } from "@nestjs/common";
import { BannersService } from "./banners.service";
import { CreateBannerDto } from "./dto/create-banner.dto";
import { UpdateBannerDto } from "./dto/update-banner.dto";
import { ReorderBannersDto } from "./dto/reorder-banners.dto";

@Controller()
export class AdminBannerController {
    constructor(private readonly bannersSerrvice: BannersService) { }

    @Post()
    async create(@Body() dto: CreateBannerDto) {
        // return this.bannersSerrvice.create(dto);
        const banner = await this.bannersSerrvice.create(dto);
        return {
            success: true,
            statusCode: 201,
            message: 'Banner created successfully',
            data: banner,
        }
    }

    @Get()
    async findAll() {
        const banner = await this.bannersSerrvice.findAll();

        return {
            success: true,
            statusCode: 201,
            message: 'Banner fetched successfully',
            data: banner,
        }
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.bannersSerrvice.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateBannerDto) {
        return this.bannersSerrvice.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.bannersSerrvice.remove(id);
    }

    @Post(':id/toggle')
    toggle(@Param('id') id: string) {
        return this.bannersSerrvice.toggle(id);
    }

    @Post('reorder')
    reorder(@Body() dto: ReorderBannersDto) {
        return this.bannersSerrvice.reorder(dto);
    }
}