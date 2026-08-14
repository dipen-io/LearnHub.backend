import { Injectable } from "@nestjs/common";

@Injectable()
export class WishlistService {
    findAll(){
        return "get all wishlist";
    }
}
