import { sql } from 'drizzle-orm';

export async function up(db: any) {
  await db.execute(sql`
    ALTER TABLE courses
    ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (
      to_tsvector('english', coalesce(course_title, '') || ' ' || coalesce(description, ''))
    ) STORED;

    CREATE INDEX idx_courses_search ON courses USING GIN(search_vector);
  `);
}

export async function down(db: any) {
  await db.execute(sql`DROP INDEX IF EXISTS idx_courses_search;`);
  await db.execute(sql`ALTER TABLE courses DROP COLUMN IF EXISTS search_vector;`);
}
