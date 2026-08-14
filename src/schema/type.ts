import type { InferModel } from 'drizzle-orm';
import { users } from "./users";
import { course } from "./course";

export enum userRole {
    User = "user",
    Instructor = "instructor",
    Student = "student",
    Admin = "admin",
}

export type User = InferModel<typeof users>;           // For SELECT (reading from DB)
export type NewUser = InferModel<typeof users, 'insert'>;  // For INSERT (creating new user)
export type SafeUser = Omit<User, 'password'>;
export type Course = InferModel<typeof course>;
