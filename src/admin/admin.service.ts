import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { eq, and, or, ilike, sql } from "drizzle-orm";
import { db } from "src/config/db";
import { instructorProfiles, studentProfile, users } from "src/schema";
import { userRole } from "src/schema/type";

@Injectable()
export class AdminService {

  // GET all pending Instructor
  async getPendingInstructorReq() {
    const pending = await db.query.instructorProfiles.findMany({
      where: eq(instructorProfiles.approvalStatus, "pending"),
      with: {
        user: true
      },
    })

    return {
      success: true,
      message: "Fetched Pending Instrotor",
      data: pending,
    }
  }

  // PATCH To Approve the INSTRUCTOR
  async approveInstructorRequest(instructorId: number, adminId: number, status: 'accept' | 'reject') {

    // 1️⃣ Validate instructor (and make sure not already approved)
    const instructor = await db.query.instructorProfiles.findFirst({
      where: eq(instructorProfiles.id, instructorId),
    });

    if (!instructor) {
      throw new NotFoundException('Instructor not found.');
    }

    // 2️⃣ Validate admin user
    const admin = await db.query.users.findFirst({
      where: and(eq(users.id, adminId), eq(users.role, userRole.Admin)),
    });

    if (!admin) {
      throw new UnauthorizedException('Only admins can approve instructors.');
    }

    // Check instructor is already approved
    if (status === "accept") {
      if (instructor.approvalStatus === "approved") {
        return {
          success: true,
          message: "Instructor is already approved!"
        }
      }

      // update instructor profile
      await db
        .update(instructorProfiles)
        .set({
          approvalStatus: "approved",
          approvedAt: new Date(),
          approvedBy: adminId
        })
        .where(eq(instructorProfiles.id, instructorId));

      // 4️⃣ Update user role to Instructor
      await db
        .update(users)
        .set({
          role: userRole.Instructor,
        })
        .where(eq(users.id, instructor.userId));

      // 5️⃣ Return response
      return {
        success: true,
        message: 'Instructor approved successfully.',
      };
    }

    // REJECT
    if (status === "reject") {

      // update instructor profile
      await db.update(instructorProfiles)
        .set({
          approvalStatus: "rejected",
          approvedBy: null,
          approvedAt: null,
          rejectCount: +1
        })
        .where(eq(instructorProfiles.id, instructorId));

      return {
        success: true,
        message: "Instructor rejected successfully."
      };
    }
    // 4️⃣ Safety: invalid status
    throw new BadRequestException('Invalid status value. Must be "accept" or "reject".');
  }

  //GET ApprovedInstructor
  async getApprovedInstructor(adminId: number, search: string, page: number, limit: number) {

    try {
      const admin = await db.query.users.findFirst({
        where: and(
          eq(users.id, adminId),
          eq(users.role, userRole.Admin)
        )
      })

      if (!admin) {
        throw new UnauthorizedException('Only Admin can perform this ');
      }

      const offset = (page - 1) * limit;
      const conditions = [eq(users.role, "instructor")];
      conditions.push(eq(instructorProfiles.approvalStatus, "approved"));

      if (search) {
        conditions.push(
          or(
            ilike(users.fullName, `%${search}%`),
            ilike(users.email, `%${search}%`),
            ilike(users.phoneNumber, `%${search}%`),
            ilike(instructorProfiles.channelName, `%${search}%`),
          ),
        );
      }

      const whereClause = and(...conditions);

      //Fetched Data
      const data = await db.select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        phoneNumber: users.phoneNumber,
        channelName: instructorProfiles.channelName,
        totalEarned: instructorProfiles.totalEarned,
        createdAt: users.createdAt,
        isActive: users.isActive
      })
        .from(instructorProfiles)
        .innerJoin(users, eq(users.id, instructorProfiles.userId))
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(sql`${users.createdAt} DESC`);

      //Count Total
      const totalResult = await db.select({ count: sql<number>`count(*)` })
        .from(instructorProfiles)
        .innerJoin(users, eq(users.id, instructorProfiles.userId))
        .where(whereClause)

      const total = Number(totalResult[0]?.count || 0);

      // const ApprovedInstructor = await db.query.instructorProfiles.findMany({
      //     where:  eq(instructorProfiles.approved, true),
      //     with: {
      //         user: true
      //     }
      // })

      // if (!ApprovedInstructor || ApprovedInstructor.length === 0) {
      //     throw new NotFoundException("No Instructor found!");
      // }

      return {
        success: true,
        message: "Instructor fetched successfully",
        data: data,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    } catch (error) {
      console.error("[InstructorService] Error fetching instructor: ", error);
      throw new BadRequestException("Failed to fetch instructor");
    }
  }

  //make user inctive/inactive
  async UserUpdateStatus(adminId: number, status: string, userId: number) {
    try {
      if (!["active", "inactive"].includes(status)) {
        throw new Error(`Invalid status. Must be "active" or "inactive"`);
      }

      //check id is vaid or not or no need
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        throw new NotFoundException("Invalid userId");
      }

      await db
        .update(users)
        .set({ isActive: status === "active" ? true : false })
        .where(eq(users.id, userId));

      return { success: true, message: `User marked as ${status}` };

    } catch (error) {
      console.error("Error making user Inctive", error)
      throw new BadRequestException("Failed to make user inactive");
    }
  }

  //DELTE USER PARMANENTLY
  async DeleteUserParmanently(adminId: number, userId: number) {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
      })

      if (!user) {
        return new NotFoundException(`User with ID ${userId} Not Found`)
      }

      // 1.First:  Delete  instructorProfiles
      await db.delete(instructorProfiles).where(eq(instructorProfiles.userId, userId));

      // 2.Second: Delete  studentProfiles
      await db.delete(studentProfile).where(eq(studentProfile.userId, userId));

      // 3.Final:  Delete  Users
      await db.delete(users).where(eq(users.id, userId));

      return { success: true, message: `User with ID ${userId} Deleted Parmanently` };
    } catch (error) {
      console.error("Error making user Inctive", error)
      throw new BadRequestException("Failed Deleting User");
    }
  }

  async allusersCount() {

    // Count All Users
    const [{ count: totalUsers }] = await db
      .select({ count: sql<number>`count(${users.id})` })
      .from(users);

    // Count All Admins
    const [{ count: totalAdmins }] = await db
      .select({ count: sql<number>`count(${users.id})` })
      .from(users)
      .where(eq(users.role, userRole.Admin));

    // Count all instructors (users who have instructorProfiles)
    const [{ count: totalInstructors }] = await db
      .select({ count: sql<number>`count(${instructorProfiles.id})` })
      .from(instructorProfiles);

    // Count all students (users who have studentProfile)
    const [{ count: totalStudents }] = await db
      .select({ count: sql<number>`count(${studentProfile.id})` })
      .from(studentProfile);

    return {
      success: true,
      message: 'User counts fetched successfully',
      data: {
        totalUsers: Number(totalUsers),
        totalAdmins: Number(totalAdmins),
        totalInstructors: Number(totalInstructors),
        totalStudents: Number(totalStudents),
      },
    };
  }

}

