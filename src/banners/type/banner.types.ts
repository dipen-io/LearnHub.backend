import { banners } from "src/schema/banner";

export type Banner = typeof banners.$inferInsert;
export type NewBanner = typeof banners.$inferSelect;