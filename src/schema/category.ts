import { timestamp, text, uuid, pgTable } from "drizzle-orm/pg-core";

export const categories = pgTable('categories', {
    id: uuid('id').defaultRandom().primaryKey(),

    // Category Name
    name: text('name').notNull().unique(),
    // Category slug
    // This is the URL-friendly version of the name.
    // (e.g., "graphic-design" for yoursite.com/categories/graphic-design)
    slug: text('slug').notNull().unique(),

    //Desc (For SEO)
    description: text('description'),

    // Good to have
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at') .defaultNow().$onUpdate(() => new Date()),

});
