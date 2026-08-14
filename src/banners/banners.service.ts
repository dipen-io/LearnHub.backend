// src/banners/banners.service.ts

import { Injectable, NotFoundException } from "@nestjs/common";
import { QueryBannersDto } from "./dto/query-banners.dto";
import { db } from "src/config/db";
import { banners } from "src/schema/banner";
import { and, asc, desc, eq, gte, isNull, lte, or, sql } from "drizzle-orm";
import { BannerPlatform } from "./enums/banner-platform.enum";
import { TargetAudience } from "./enums/target-audience.enum";
import { CreateBannerDto } from "./dto/create-banner.dto";
import { UpdateBannerDto } from "./dto/update-banner.dto";
import { ReorderBannersDto } from "./dto/reorder-banners.dto";


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

    // user implession | clicked 
    async track(id: string, event: 'impression' | 'click') {

        const column = event === 'impression' ? banners.impressions
            : banners.clicks;

        await db.update(banners)
            .set({ [column.name]: sql`${column} + 1` })
            .where(eq(banners.id, id));

        return { success: true };
    }

    // Admin 
    async create(dto: CreateBannerDto) {
        const [banner] = await db
            .insert(banners)
            .values({
                ...dto,
                content: dto.content,
                startAt: dto.startAt ? new Date(dto.startAt) : null,
                endAt: dto.endAt ? new Date(dto.endAt) : null,

            })
            .returning();

        return banner;
    }

    async findAll() {
        return db
            .select()
            .from(banners)
            .orderBy(asc(banners.priority), desc(banners.createdAt));
    }

    async findOne(id: string) {
        const [banner] = await db
            .select()
            .from(banners)
            .where(eq(banners.id, id))
            .limit(1);

        if (!banner) throw new NotFoundException('Banner not found!');
        return banner;
    }

    async update(id: string, dto: UpdateBannerDto) {
        await this.findOne(id);

        const updateDate: any = { ...dto };
        if (dto.startAt) updateDate.startAt = new Date(dto.startAt);
        if (dto.endAt) updateDate.endAt = new Date(dto.endAt);

        const [banner] = await db
            .update(banners)
            .set(updateDate)
            .where(eq(banners.id, id))
            .returning()

        return banner;
    }

    async remove(id: string) {
        await this.findOne(id);
        await db.delete(banners).where(eq(banners.id, id));
        return { id, deleted: true };
    }

    async toggle(id: string) {
        const banner = await this.findOne(id);

        const [updated] = await db
            .update(banners)
            .set({ isActive: !banner.isActive })
            .where(eq(banners.id, id))
            .returning();

        return updated;
    }

    async reorder(dto: ReorderBannersDto) {
        const updates = dto.items.map((item) =>
            db.update(banners).set({ priority: item.priority })
                .where(eq(banners.id, item.id)),
        );

        await Promise.all(updates)
        return { reordered: true };
    }
}