// src/banners/banners.service.ts

import { Injectable, NotFoundException } from "@nestjs/common";
import { QueryBannersDto } from "./dto/query-banners.dto";
import { db } from "src/config/db";
import { banners } from "src/schema/banner";
import { and, asc, desc, eq, gte, isNull, lte, or } from "drizzle-orm";
import { BannerPlatform } from "./enums/banner-platform.enum";
import { TargetAudience } from "./enums/target-audience.enum";


@Injectable()
export class BannersService {

    // Fetch active banners (PUBLIC)
    async findActive(query: QueryBannersDto) {
        const now = new Date();

        const conditions = [
            eq(banners.isActive, true),
            eq(banners.position, query.position),
            or(
                isNull(banners.startAt),
                lte(banners.startAt, now),
            ),
            or(
                isNull(banners.endAt),
                gte(banners.endAt, now),
            ),
        ];

        if (query.platform) {
            conditions.push(
                or(
                    eq(banners.platform, query.platform),
                    eq(banners.platform, BannerPlatform.ALL),
                ),
            );
        }

        // const qb = await db.query.banner
        if (query.version) {
            conditions.push(
                or(
                    isNull(banners.appVersionMin),
                    lte(banners.appVersionMax, query.version),
                )
            )
        }

        if (query.userType) {
            conditions.push(
                or(
                    eq(banners.targetAudience, query.userType as any),
                    eq(banners.targetAudience, TargetAudience.ALL)
                )
            )
        }

        const result = await db.select({
            id: banners.id,
            type: banners.type,
            priority: banners.priority,
            content: banners.content,
        })
            .from(banners)
            .where(and(...conditions))
            .orderBy(asc(banners.priority), desc(banners.createdAt));

        return result;
    }
}