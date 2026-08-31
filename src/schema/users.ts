import {
  decimal,
  integer,
  pgTable,
  serial,
  varchar,
  timestamp,
  boolean,
  text,
  index,
  jsonb,
  unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { approvedInstructorStatusEnum, userRoleEnum } from './enum';

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    fullName: varchar('full_name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    phoneNumber: varchar('phone_number', { length: 20 }).unique(),
    password: varchar('password', { length: 255 }).notNull(), // hashed password
    // role: varchar('role', { length: 50 }).default(userRole.User).notNull(), // default role is 'user'
    role: userRoleEnum('role').default('user').notNull(),
    isActive: boolean('isActive').default(true).notNull(),
    profilePicture: varchar('profile_picture', { length: 255 }),
    isVerified: boolean('is_verified').default(false),
    emailVerified: boolean('email_verified').default(false),
    // dateOfBirth: timestamp('date_of_birth'),
    state: text('state'),
    // bio: text('bio'), removed
    lastLogin: timestamp('last_login'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
    refreshToken: varchar('refresh_token', { length: 255 }),
    tokenVersion: integer('token_version').default(0),
    resetPasswordToken: varchar('reset_password_token', { length: 255 }),
    resetPasswordExpire: timestamp('reset_password_expire'),
  },
  (table) => [
    // emailIdx: index('email_idx').on(table.email), no need .unique() already make index
    index('role_idx').on(table.role),
  ],
);

//there will be two user schema more
//first one is studentProfile
// and Second one is instructorProfile
export const studentProfile = pgTable(
  'student_profile',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id') //TODO: need to change it student
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    learningGoals: text('learning_goals'),
    preferences: jsonb('preferences').default({}),
  },
  (table) => [
    unique('student_user_idx').on(table.userId),
  ],
);

// Instructor Profiles
export const instructorProfiles = pgTable(
  'instructor_profiles',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id') //TODO: instructor
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // channelName: varchar('channel_name', { length: 255 }),
    channelName: varchar('channel_name', { length: 255 }).notNull().unique(),
    channelThumbnail: varchar('channel_thumbnail', { length: 255 }),
    expertise: varchar('expertise', { length: 255 }).array(),
    bio: text('bio'),
    socialLinks: jsonb('social_links').default({}),
    paymentDetails: jsonb('payment_details'),
    totalEarned: decimal('total_earned', { precision: 10, scale: 2 }).default(
      '0.00',
    ),
    pendingBalance: decimal('pending_balance', {
      precision: 10,
      scale: 2,
    }).default('0.00'),
    // approved: boolean('approved').default(false),
    approvalStatus: approvedInstructorStatusEnum('approval_status').default('pending').notNull(),
    approvedAt: timestamp('approved_at'),
    approvedBy: integer('approved_by').references(() => users.id),
    rejectCount: integer("reject_count").default(0).notNull(),
  },
  (table) => [
    unique('instructor_user_idx').on(table.userId),
  ],
);

// User relations (User -> Profiles)
export const userRelations = relations(users, ({ one }) => ({
  studentProfile: one(studentProfile, {
    fields: [users.id],
    references: [studentProfile.userId],
  }),
  instructorProfiles: one(instructorProfiles, {
    fields: [users.id],
    references: [instructorProfiles.userId],
  }),
}))

// student profile relations(Student -> User)
export const studentProfileRelations = relations(studentProfile, ({ one }) => ({
  user: one(users, {
    fields: [studentProfile.userId],
    references: [users.id],
  })
}))

export const instructorProfileRelations = relations(instructorProfiles, ({ one }) => ({
  user: one(users, {
    fields: [instructorProfiles.userId],
    references: [users.id],
  }),
}));
