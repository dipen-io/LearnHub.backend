import { Controller, Get, Post, Query, Request } from "@nestjs/common";
import { CartService } from "./cart.service";
// import { RequestWithUser } from "src/common/interface/request_interface";
import * as request_interface from 'src/common/interface/request_interface';

@Controller("cart")
export class CartController {
    constructor (private readonly cartService : CartService) {};

    @Get()
    findAllCart(
        @Request() req: request_interface.RequestWithUser,
        @Query("page") page:number,
        @Query("limit") limit:number,
    ){
        const userId = req.user.userId
        return this.cartService.fetchCartItems(userId, page, limit);
    }

    @Post("add")
    addToCart(
        @Request() req: request_interface.RequestWithUser,
        @Query("courseId") courseId: string
    ){
        const userId = req.user.userId;
        return this.cartService.addToCart(userId, courseId);
    }

    @Post("remove-one")
    removeFromCart(
        @Request() req: request_interface.RequestWithUser,
        @Query("courseIdj") courseId: string
    ){
        const userId = req.user.userId;
        return this.cartService.removeFromCart(userId, courseId);
    }

    @Post("remove-all")
    removeAllFromCart(
       @Request() req: request_interface.RequestWithUser
    ){
        const userId = req.user.userId
        return this.cartService.clearCart(userId);
    }

    @Post("check")
    checkIfExist(
        @Request() req: request_interface.RequestWithUser,
        @Query("courseId") courseId: string
    ){
        const userId = req.user.userId;
        return  this.cartService.checkCourseExist( userId, courseId);
    }

}
