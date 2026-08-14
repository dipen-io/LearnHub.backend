// import { jsonb, timestamp, pgTable, text, integer, uuid, pgEnum, boolean, varchar, index } from "drizzle-orm/pg-core";

// export const bannerTypeEnum = pgEnum('banner_type', [
//     'hero_carousel',
//     'promo_strip',
//     'announcement',
//     'course_featured',
//     'category_pills'
// ]);

// export const bannerPositionEnum = pgEnum('banner_position', [
//     'home_top',
//     'home_middled',
//     'explore_banner',
//     'profile_banner',
//     'my_learning_top'
// ]);

// export const bannerPlatformEnum = pgEnum('banner_platform', [
//     'all',
//     'ios',
//     'android'
// ]);

// export const targetAudienceEnum = pgEnum('target_audience', [
//     'all',
// ]);

// export const banners = pgTable("banners", {

//     id: uuid('id').primaryKey().defaultRandom(),
//     name: text('name').notNull(),
//     type: bannerTypeEnum('type').notNull(),
//     position: bannerPositionEnum('position').notNull(),
//     priority: integer('priority').notNull().default(0),
//     isActive: boolean('is_active').notNull().default(true),
//     platform: bannerPlatformEnum('platform').notNull().default('all'),
//     appVersionMin: varchar('app_version_min'),
//     appVersionMax: varchar('app_version_max'),
//     targetAudience: targetAudienceEnum('target_audience').notNull().default('all'),

//     targetCategories: varchar('target_categories').array(),
//     startAt: timestamp('start_at', { withTimezone: true }),
//     endAt: timestamp('end_at', { withTimezone: true }),

//     content: jsonb('content').notNull(),
//     impressions: integer('impressions').notNull().default(0),
//     clicks: integer('clicks').notNull().default(0),

//     createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
//     updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
// }, (table) => {
//     return {
//         positionActiveDatesIdx: index('banners_position_is_active_start_end_idx').on(
//             table.position,
//             table.isActive,
//             table.startAt,
//             table.endAt,
//         ),
//     }
// })


import {
    pgTable,
    uuid,
    varchar,
    integer,
    boolean,
    timestamp,
    jsonb,
    pgEnum,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { course } from './course';

export const bannerTypeEnum = pgEnum('banner_type', [
    'hero_carousel',
    'promo_strip',
    'announcement',
    'course_featured',
    'category_pills',
]);

export const bannerPositionEnum = pgEnum('banner_position', [
    'home_top',
    'home_middle',
    'explore_header',
    'profile_banner',
    'my_learning_top',
]);

export const bannerPlatformEnum = pgEnum('banner_platform', [
    'all',
    'ios',
    'android',
]);

export const targetAudienceEnum = pgEnum('target_audience', [
    'all',
    'guests',
    'logged_in',
    'new_users',
    'returning',
]);

export const banners = pgTable('banners', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    type: bannerTypeEnum('type').notNull(),
    position: bannerPositionEnum('position').notNull(),
    priority: integer('priority').default(0).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    platform: bannerPlatformEnum('platform').default('all').notNull(),
    appVersionMin: varchar('app_version_min', { length: 20 }),
    appVersionMax: varchar('app_version_max', { length: 20 }),
    targetAudience: targetAudienceEnum('target_audience').default('all').notNull(),
    targetCategories: jsonb('target_categories').$type<string[]>(),
    startAt: timestamp('start_at', { withTimezone: true }),
    endAt: timestamp('end_at', { withTimezone: true }),
    content: jsonb('content').$type<Record<string, any>>().notNull(),
    impressions: integer('impressions').default(0).notNull(),
    clicks: integer('clicks').default(0).notNull(),
    // createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),

    // featuredCourseId: uuid('featured_course_id').references(() => course.id),
    // featuredInstructorId: uuid('featured_instructor_id').references(() => users.id),
});