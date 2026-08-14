import { Module} from "@nestjs/common";
import { Course as CourseControler} from "./course.controller";
import { CourseService } from "./course.services";
import { AuthModule } from "src/auth/auth.module";
import { FileModule } from "src/file/file.module";

@Module({
    imports:[AuthModule, FileModule],
    controllers: [CourseControler],
    providers: [CourseService],
})

export class CourseModule {};
