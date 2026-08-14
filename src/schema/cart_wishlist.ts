import { pgTable, uuid, integer, timestamp} from "drizzle-orm/pg-core";
import { studentProfile } from "./users";
import { course } from "./course";

//CART
export const CartItems = pgTable(
    "cart_items",{
        id: uuid('id').defaultRandom().primaryKey(),
        studentId: integer('student_id').notNull().references(() => studentProfile.id,
            {onDelete: "cascade"}),
        courseId: uuid("course_id").notNull().references(()=> course.id, {
            onDelete: "cascade"
        }),
        addedAt: timestamp("added_at").defaultNow()
    }
)

//WISHLIST
export const Wishlist = pgTable(
    "wishlist",{
        id: uuid('id').defaultRandom().primaryKey(),
        studentId: integer('student_id').notNull().references(() => studentProfile.id, {
            onDelete: "cascade"
        }),
        courseId: uuid("course_id").notNull().references(() => course.id, {
            onDelete: "cascade"
        }),
        addedAt: timestamp("added_at").defaultNow()
    }
)
