import { Injectable } from "@nestjs/common";
import { eq, sql } from "drizzle-orm";
import { db } from "src/config/db";
import { CartItems, course } from "src/schema";

@Injectable()
export class CartService {
    // get cart items
async fetchCartItems(userId: number, page: number = 1, pageSize: number = 10) {
 try {
        // Calculate offset based on the current page
        const offset = (page - 1) * pageSize;

        // Fetch paginated cart items
        const cartItems = await db.query.CartItems.findMany({
            where: eq(CartItems.studentId, userId),
            limit: pageSize, // Limit the number of items per page
            offset: offset,  // Skip the items based on the page
            orderBy: sql`${CartItems.addedAt} DESC`
        });

       const totalItems = (await db.query.CartItems.findMany({
            where: eq(CartItems.studentId, userId)
        })).length;

        // Calculate total number of pages
        const totalPages = Math.ceil(totalItems / pageSize);

        return {
            success: true,
            message: "Cart items fetched successfully",
            data: cartItems,
            pagination: {
                totalItems,
                totalPages,
                currentPage: page,
                pageSize
            }
        };
    } catch (error) {
        console.error("Error fetching cart items: ", error);
        return {
            success: false,
            message: "There was an error fetching the cart items"
        };
    }
    }

    // add to cart
    async addToCart(userId: number, courseId: string){
        try {

        // check course id is valid
        const courseExist = await db.query.course.findFirst({
            where: eq(course.id, courseId)
        })
        if (!courseExist) {
            return {
                success: false,
                message: "Course does not exist"
            }
        }
        // check course is already exist or not
        const courseInCart  = await db.query.CartItems.findFirst({
            where: eq(CartItems.studentId, userId)
                && eq(CartItems.courseId, courseId)
        })
        if (!courseInCart){
            return {
                success: false,
                message: "Course is not in Cart"
            }
        }
        // then add to cart
        await db.insert(CartItems).values({
            studentId: userId,
            courseId: courseId
            // Add any additional fields here, such as quantity, price, etc.
        });
        return {
                success: true,
                message: "Course has been added to Cart successfully"
            }
        } catch (error) {
             console.error("Error adding course to Cart", error)
            return {
                success: false,
                message: "There was an error adding course to Cart"
            }
        }
    }

    // remove from cart
    async removeFromCart(userId: number, courseId: string){
        // check course id is valid
        const couseExist = await db.query.course.findFirst({
            where: eq(course.id, courseId)
        })
        if (!couseExist){
            return {
                success: false,
                message: "Course does not exist"
            }
        }
        const courseInCart = await db.query.CartItems.findFirst({
            where : eq(CartItems.studentId, userId) && eq(CartItems.courseId, courseId)
        })
        if (!courseInCart){
            return {
                success: false,
                message: "Course is not in Cart"
            }
        }
        await db.delete(CartItems).where(eq(CartItems.studentId, userId) && eq(CartItems.courseId, courseId))
        return {
            success: true,
            message: "Course Removed successfully"
        }
    }

    // clear cart
    async clearCart(userId: number) {
        try {
            await db.delete(CartItems).where(eq(CartItems.studentId, userId));
            return {
                success: true,
                message: "Cart has been clear successfully"
            }
        } catch (error) {
           console.error("Error clearing cart")
            return {
                success: false,
                message: "There was an error clearing cart"
            }
        }
    }

    // cleck if courseId already exist
    async checkCourseExist(userId: number, courseId: string) {
        const courseInCart = await db.query.CartItems.findFirst({
            where: eq(CartItems.studentId, userId) && eq(CartItems.courseId, courseId)
        })
        if (courseInCart) {
            return {
                success: false,
                message: "User Does't have cart right now"
            }
        }
        return {
            success: true,
            message: "Course is not in the cart"
        };
    }

}
