import { pgEnum } from "drizzle-orm/pg-core";

export const approvedInstructorStatusEnum = pgEnum('approval_status', [
  'pending',
  'approved',
  'rejected',
]);

export const courseLevelEnum = pgEnum('course_level', [
  'beginner',
  'intermediate',
  'advanced',
  'all',
])
