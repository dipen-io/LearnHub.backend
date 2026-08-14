//handle db logics

import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { cleanNullUndefined } from 'src/common/filters/null-undefined.filter';
import { CreateUserDto, LoginUserDto } from './user.dto';
import { db } from 'src/config/db';
import { instructorProfiles, studentProfile, users } from '../schema/users';
import { and, eq, or, ilike } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { SafeUser, User, userRole } from 'src/schema/type';
import { AuthService } from 'src/auth/auth.service';
import { updatePasswordDto } from './DTO/user.dto';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from 'src/common/dto/response.dto';
import { Roles } from 'src/auth/roles.decorator';

type userTypes = "users" | "students";

@Injectable()
export class UserService {

  constructor(
    private authService: AuthService
  ) { }

  //Hash Password
  async hashPassword(plainPassword: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(plainPassword, saltRounds);
  }

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const userToCreate = {
      fullName: createUserDto.fullName,
      email: createUserDto.email,
      phoneNumber: createUserDto.phoneNumber,
      password: hashedPassword,
      role: createUserDto.role ?? userRole.User,
      isActive: createUserDto.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    try {
      //check here if the email and phoneNumber is already exist in db
      const exisintUser = await db.query.users.findFirst({
        where: or(
          eq(users.email, createUserDto.email),
          eq(users.phoneNumber, createUserDto.phoneNumber ?? ''),
        ),
      });
      if (exisintUser) {
        throw new ConflictException(
          exisintUser.email === createUserDto.email
            ? 'Email already exist'
            : 'phoneNumber already exist',
        );
      }
      const [newUser] = await db.insert(users).values(userToCreate).returning();

      // Don't return the password

      // Use the existing tokenVersion from DB
      const tokenVersion = newUser.tokenVersion ?? 0;

      const token = await this.authService.generateTokens({ userId: newUser.id, role: newUser.role as userRole, tokenVersion })
      //save refreshToken in db
      await db.update(users)
        .set({ refreshToken: await bcrypt.hash(token.refreshToken, 10) })
        .where(eq(users.id, newUser.id));


      const { password: _password, ...safeUser } = newUser as User;

      return { safeUser: safeUser as SafeUser, accessToken: token.accessToken, refreshToken: token.refreshToken };


    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Database error');
    }
  }

async findAll(
  search: string = '',
  limit: number = 30,
  page: number = 1,
  type: userTypes = "users",
  status?: string,
) {
  try {
    const skip = (page - 1) * limit;

    if (type === 'students') {
      const condition = [];
      if (search) {
          condition.push(ilike(studentProfile.learningGoals,`%${search}%` ));
       }

        //NO NEED I GUESS
        // if (status == "active") {
        //      condition.push(eq(users.isActive, true));
        //  }else if (status == "inactive") {
        //      condition.push(eq(users.isActive, false));
        // }

      const query = db
        .select() // select all columns
        .from(studentProfile)
        .innerJoin(users, eq(users.id, studentProfile.userId))
        .where(and(...condition));

      const total = (await query.execute()).length;
      const data = await query.limit(limit).offset(skip).execute();

      return {
        success: true,
        message: `student fetched successfully`,
        data,
        pagination: {
          total,
          page,
          limit,
          totalPage: Math.ceil(total / limit),
        },
      };
    }

// users query
const query = db
  .select() // select all columns
  .from(users)
  .where(
    and(
      // Always filter by role
      eq(users.role, userRole.User),

      // Optional search filter
      search
        ? or(
            ilike(users.fullName, `%${search}%`),
            ilike(users.email, `%${search}%`),
            ilike(users.phoneNumber, `%${search}%`)
          )
        : undefined,

      // Optional status filter
      status === 'active'
        ? eq(users.isActive, true)
        : status === 'inactive'
        ? eq(users.isActive, false)
        : undefined
    )
  );

    // users query
    // const query = db
    //   .select() // select all columns
    //   .from(users)
    //   .where(
    //     (search || true) // we will combine search and role filter
    //       ? and(
    //           eq(users.role, userRole.User ),
    //           search
    //             ? or(
    //                 ilike(users.fullName, `%${search}%`),
    //                 ilike(users.email, `%${search}%`),
    //                 ilike(users.phoneNumber, `%${search}%`)
    //               )
    //             : undefined
    //         )
    //       : undefined
    //   );

    const total = (await query.execute()).length;
    const data = await query.limit(limit).offset(skip).execute();

    return {
      success: true,
      message: `user fetched successfully`,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPage: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('DB error:', error);
    return {
      status: 'error',
      message: 'Internal server error',
    };
  }
}

  //ME
  async profile(userId: number) {

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    })

    const [studentDetails, instructorDetails] = await Promise.all([
        db.query.studentProfile.findFirst({
          where: eq(studentProfile.userId, userId),
        }),
        db.query.instructorProfiles.findFirst({
          where: eq(instructorProfiles.userId, userId),
        }),
      ]);

    const formatedResponse = plainToInstance(UserResponseDto, user, {
        excludeExtraneousValues: true,
    })

    const finalResponse = {
        success: true,
        data: cleanNullUndefined(formatedResponse), // Base User Data

        studentData: studentDetails
          ? {
              learningGoals: studentDetails.learningGoals || '',
              preferences: studentDetails.preferences || {},
            }
          : null,

        instructorData: instructorDetails
          ? {
              id: instructorDetails.id,
            }
          : null,
      };
      return finalResponse;
  }

  //LOGIN
  async login(loginDto: LoginUserDto) {
    const { email, password, phoneNumber, Roles } = loginDto;
    const conditions = [];
    if (email || phoneNumber) {
        conditions.push(
        or(email ? eq(users.email, email): undefined,
            phoneNumber ? eq(users.phoneNumber, phoneNumber) : undefined,
          )
       )
    }
    if (Roles) {
        conditions.push(eq(users.role, Roles));
     }

    const user = await db.query.users.findFirst({
            where: and(...conditions),
        })
    if (!user) {
      throw new NotFoundException('User not found!');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid password');
    }

    // Use the existing tokenVersion from DB
    const tokenVersion = user.tokenVersion ?? 0;

    const token = await this.authService.generateTokens({ userId: user.id, role: user.role as userRole, tokenVersion })
    //save refreshToken in db
    await db.update(users)
      .set({ refreshToken: await bcrypt.hash(token.refreshToken, 10) })
      .where(eq(users.id, user.id));

    const { password: _password, ...safeUser } = user;
    return { safeUser, accessToken: token.accessToken, refreshToken: token.refreshToken };

  }

  async findOne(id: number) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { password: _password, ...safeUser } = user;
    return {
      status: 'success',
      data: safeUser,
    };
  }

  //me password
  async updateProfile(updatePasswordDto: updatePasswordDto, userId: number) {

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    //compare the password
    const isPasswordMatched = await bcrypt.compare(updatePasswordDto.password, user.password)
    if (!isPasswordMatched) {
      throw new BadRequestException("Current password is incorrect");
    }
    //hash the password
    const hashPassworded = await this.hashPassword(updatePasswordDto.newPassword)
    //update the password
    await db.update(users)
      .set({ password: hashPassworded })
      .where(eq(users.id, userId))

    const { password: _password, ...safeUser } = user;
    return {
      success: true,
      data: safeUser,
      message: 'new password set successfully',
    };
  }
}
