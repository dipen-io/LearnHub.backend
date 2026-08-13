import { applyDecorators, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/auth/auth.guard";
import { RolesGuard } from "src/auth/role.guard";
import { Roles } from "src/auth/roles.decorator";
import { userRole } from "src/schema/type";

//ONLY ADMIN
export  function Admin() {
    return applyDecorators(
        UseGuards(AuthGuard, RolesGuard),
        Roles(userRole.Admin)
    )
}

//ONLY INSTRUCTOR
export  function Instructor() {
    return applyDecorators(
        UseGuards(AuthGuard, RolesGuard),
        Roles(userRole.Instructor)
    )
}

//ONLY STUDENT
export  function Student() {
    return applyDecorators(
        UseGuards(AuthGuard, RolesGuard),
        Roles(userRole.Student)
    )
}
