//src/banners/banners.module.ts

import { Module } from "@nestjs/common";
import { BannersService } from "./banners.service";
import { BannersController } from "./banners.controller";
import { AdminBannerController } from "./admin-banners.controller";

@Module({
    controllers: [BannersController, AdminBannerController],
    providers: [BannersService],
    exports: [BannersService]
})

export class BannersModule { }