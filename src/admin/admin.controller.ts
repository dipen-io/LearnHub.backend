import { Controller, Get, Param, Patch, Request, Delete, Query } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { Admin } from "src/common/decorator/role.protected.decorator";
import * as request_interface from 'src/common/interface/request_interface';
import { GetInstructorQueryDto } from "./dto/instructorQuery";
import { ApproavedInstructorStatusQuery } from "./dto/approvedStatusDto";

@Controller('admin')
@Admin()
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('instructor-request')
    async getAllInstructorRequest() {
        return await this.adminService.getPendingInstructorReq();
    }

    @Admin()
    @Patch('approve-instructor/:instructorId')
    async approveInstructor(
        @Query() query: ApproavedInstructorStatusQuery,
        @Param('instructorId') instructorId: string,
        @Request() req: request_interface.RequestWithUser) {
        const adminId = req.user.userId;
        const { status } = query;
        return await this.adminService.approveInstructorRequest(Number(instructorId), adminId, status);
    }

    @Admin()
    @Get("instructor")
    async getApprovedInstructor(
        @Query() query: GetInstructorQueryDto,
        @Request() req: request_interface.RequestWithUser) {
        const adminId = req.user.userId;
        const {search, limit, page} = query;
        return await this.adminService.getApprovedInstructor(adminId, search, page, limit );
    }

    // Make user Inactive/Active
    // PATCH /user/status?status=active&userId=42
    @Admin()
    @Patch("user/status")
    async UpdateUserStatus(
        @Query("status") status: string,
        @Query("userId") userId: number,
        @Request() req: request_interface.RequestWithUser) {
        const adminId = req.user.userId;
        return await this.adminService.UserUpdateStatus(adminId, status, userId);
    }

    @Admin()
    @Delete("user/delete")
    async DeleteUserPermanently(
        @Query("userId") userId: number,
        @Request() req: request_interface.RequestWithUser) {
        const adminId = req.user.userId;
        return await this.adminService.DeleteUserParmanently(adminId, userId);
    }

    //all user count by admin
    @Admin()
    @Get("user/get")
    async GetAllUsersCount() {
        return await this.adminService.allusersCount();
    }

}
