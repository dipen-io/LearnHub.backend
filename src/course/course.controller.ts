/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Get, Param, Post, Delete, Put, Body, UseGuards, Request, UseInterceptors, UploadedFile, Query } from "@nestjs/common";
import { CourseService } from "./course.services";
import { CreateCourseDto } from "./dto/create-course.dto";
import { getFileInterceptor } from "src/file/file.interceptor";
import { AuthGuard } from "src/auth/auth.guard";
import { RolesGuard } from "src/auth/role.guard";
import { Roles } from "src/auth/roles.decorator";
import { userRole } from "src/schema/type";
import type { RequestWithUser } from "src/common/interface/request_interface";
import { Admin } from "src/common/decorator/role.protected.decorator";
import { courseFilter } from "./interfaces/course.interface";
import { FileService } from "src/file/file.service";

@Controller('course')
export class Course {
    constructor(
        private readonly courseService: CourseService,
        private readonly fileService: FileService
    ) { }
    // GET all Course
    // GET /course?limit=20&cursor=eyJpZ...&sort=-price&search=react&category=web&min_price=10&max_price=100
    @Get()
    async findAll(
        @Query('limit') limit: string,
        @Query('cursor') cursor: string,
        @Query('sort') sort: string,
        @Query('search') search: string,
        @Query('min_price') min_price: string,
        @Query('max_price') max_price: string,
        @Query('category') category: string,
    ) {
        return await this.courseService.getAllCourse(
            limit, cursor, sort, search, category, min_price, max_price
        );
    }

    // GET single course
    @Get(':id')
    async getSingleCourse(@Param('id') id: string) {
        return await this.courseService.get_single_course(id);
    }

    // GET All Course By Instructor
    @Get('instructor/:InstructorId')
    async getCourseByInstructor(@Param('InstructorId') id: number) {
        console.log("InstructorID==>>>>>>>>", id)
        return await this.courseService.get_course_by_instructor(id);
    }

    //CREATE COURSE
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(userRole.Instructor)
    @Post('new')
    @UseInterceptors(getFileInterceptor("courseThumbnail"))
    createCourse(
        @UploadedFile() file: Express.Multer.File,
        @Request() req: RequestWithUser,
        @Query("instructorId") instructorId: string,
        @Body() createCourse: CreateCourseDto) {
        console.log("IS THIS ROUTE WORKING..............................")
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        // const userId: number = (req.user as any).userId
        const userId = (req as any).user.userId;
        // const upload = file ? this.fileService.uploadFile(file) : null;
        const parsedInstructorId = parseInt(instructorId, 10);
        return this.courseService.create_course(createCourse, parsedInstructorId, file)
    }

    //DELETE post here
    @Admin()
    @Delete('del/:id')
    deleteCourse(@Param('id') id: string, @Request() req: RequestWithUser) {
        return this.courseService.delete_course(id)
    }

    @Put('update')
    updateCourse() {
        return "UPDATE COURSE HERE !"
    }

    @Get('search')
    searchCourse() {
        let filter: courseFilter
        return this.courseService.searchCourses("courses", filter);
    }
}
