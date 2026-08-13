import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { AuthModule } from "src/auth/auth.module";
import { AdminSeederService } from "./admin";
import { UserService } from "src/users/user.service";

@Module({
    imports:[AuthModule, ],
    controllers: [AdminController],
    providers: [AdminService, AdminSeederService, UserService],
})
export class AdminModule{}
