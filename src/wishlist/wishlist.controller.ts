import { Controller, Get } from "@nestjs/common";
import { WishlistService } from "./wishlist.service";

@Controller("wishlist")
export class WishlistController {
    constructor (private readonly wishlistService : WishlistService) {};
    @Get()
    findAllWishlist(){
        return this.wishlistService.findAll();
    }
}
