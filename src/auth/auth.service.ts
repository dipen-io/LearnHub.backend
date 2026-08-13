import { BadRequestException, Injectable, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
// import { SendOtpDto } from './dto/sendOtpDto';
import { generateOtp, getOtpExpiry } from 'src/otp/otp.utils';
import { EmailService } from 'src/email/email.service';
import { JwtService } from '@nestjs/jwt';
import { userRole } from 'src/schema/type';
import { env } from 'src/config/env.config';
import type { Response, Request } from 'express';
import { OtpVerificationDto, OtpVerify } from './dto/otpVerificationDto';
import { db } from 'src/config/db';
import { eq } from 'drizzle-orm';
import { instructorProfiles, otp, studentProfile, users } from 'src/schema';
import { InstructorRequestDto } from './dto/instructorDto';
import { success } from 'zod';

export interface JwtPayload {
  userId: number;
  role: userRole;
  tokenVersion: number;
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly emailServie: EmailService
  ) { }

  generateTokens(payload: JwtPayload): { accessToken: string; refreshToken: string } {
    const accessToken = this.jwtService.sign(payload, { expiresIn: "15m" })
    const refreshToken = this.jwtService.sign(payload, { expiresIn: "7d", secret: env.JWT_REFRESH_SECRET })
    return { refreshToken, accessToken }
  }

  async refreshToken(req: Request, res: Response) {
    const token: string = req.cookies['refreshToken'] as string;
    if (!token) throw new UnauthorizedException();

    try {
        const payload = await this.jwtService.verifyAsync<JwtPayload>(
            token,
            { secret: env.JWT_REFRESH_SECRET }
        );

        const user = await db.query.users.findFirst({
            where: eq(users.id, payload.userId)
         })

       if (!user || user.tokenVersion !== payload.tokenVersion) {
           throw new UnauthorizedException('Invalid refresh token');
       }

        // Rorate the tokenVersion(issue new tokenVersion)
        user.tokenVersion += 1;
        await db.update(users).set({
          tokenVersion: user.tokenVersion
        }).where(eq(users.id, user.id))

      const newTokens = this.generateTokens({
        userId: payload.userId,
        role: payload.role,
        tokenVersion: user.tokenVersion
      });

      res.cookie('refreshToken', newTokens.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return {
        accessToken: newTokens.accessToken,
        data: user,
      };
    } catch (err) {
      console.error("Error: ", err)
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async otpVerifyCodeSend(otpVerifyCode: OtpVerificationDto, userId: number) {
    // Check the email is exist in User schema
    // I have created an another Schema OTP for strong otp
    // So if the id is already exit in otp shcema then just update the otp
    // Then update send the OTP to the email
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    })

    if (!user || user.email !== otpVerifyCode.email) {
      throw new Error(`User not found or email mismatched`)
    }

    // Check if the OTP record exists for this user
    const existingOtp = await db.query.otp.findFirst({
      where: eq(otp.userId, userId)
    });
    const OTP = generateOtp(6);
    const expiresAt = getOtpExpiry(3);

    if (existingOtp) {
      // update exising user OTP
      await db.update(otp).set({
        otp: OTP,
        expiresAt,
        usedAt: null //reset usage
      }).where(eq(otp.userId, userId))

    } else {
      // Create new OTP record
      await db.insert(otp).values({
        userId,
        otp: OTP,
        createdAt: new Date(),
        expiresAt
      });
    }

    //SEND HERE OTP
    await this.emailServie.sendOtpEmail(otpVerifyCode.email, OTP);
    return {
      success: true,
      message: "OTP Send Sucessfully!",
      data: {
        userId: user.id,
        email: user.email,
        otpExpiresAt: expiresAt,
        otp: OTP,
      },
    }
  }

  // VERIFICATION OTP
  // THEN MAKE STUDENT_TYPE
  async otpVerify(otpVerify: OtpVerify, userId: number): Promise<any>{

    const existingOtp = await db.query.otp.findFirst({
      where: eq(otp.userId, userId)
    });

    if (!existingOtp || existingOtp.otp !== otpVerify.otp) {
      throw new Error("OTP Not Matched!")
    }
    // 3. Check if already used
    if (existingOtp.usedAt) {
      throw new Error('OTP already used!');
    }

    // 4. Check if expired
    const now = new Date();
    if (existingOtp.expiresAt < now) {
      throw new Error('OTP has expired!');
    }
    // 5. mark otp as used
    await db.update(otp).set({usedAt: now}).where(eq(otp.userId, userId));

    // update the users
    await db.update(users)
    .set({
      emailVerified: true,
      isVerified: true,
      role: userRole.Student
    }).where(eq(users.id, userId));

    //create an student profile
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const newStudent = await db.insert(studentProfile).values({
      userId,
      learningGoals: "",
      preferences: {},
    });

    return {
    success: true,
    message: 'Email verified and student profile created!',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    data: newStudent,
  };

  }

  async requestInstructor(dto: InstructorRequestDto, userId: number): Promise<any> {

    const MAX_REJECT_COUNT = 5;

    const existingInstructor = await db.query.instructorProfiles.findFirst({
      where: eq(instructorProfiles.userId, userId)
    })

    if (existingInstructor) {
        if (existingInstructor.approvalStatus === "pending") {
          return { success: true, message: "You hahe already submitted an instructor request!" };
        }
        if (existingInstructor.approvalStatus === "rejected") {
            const rejectCount = existingInstructor.rejectCount || 0;

            if (rejectCount >= MAX_REJECT_COUNT) {
                return {
                    success: false,
                    message: "You have exceeded the maximum number of instructor requests."
                };
            }

            // Reset profile to pending for re-submission
            await db.update(instructorProfiles)
                .set({ approvalStatus: "pending" })
                .where(eq(instructorProfiles.userId, userId));

            return {
                success: true,
                message: `Rejectet ${rejectCount} re-submission again !`
            }
        }

          // If somehow approved already
          return { success: true, message: "You are already an approved instructor!" };
     }

    if (!dto.channelName || typeof dto.channelName !== 'string') {
      throw new BadRequestException('channelName is required and must be a string');
    }

    await db.insert(instructorProfiles).values({
      userId,
      channelName: dto.channelName,
      expertise: dto.expertise,
      socialLinks: dto.socialLinks,
      paymentDetails: dto.paymentDetails,
      // approved remains false by default
    });

    return {
      success: true,
      message: 'Instructor request submitted. Awaiting admin approval.',
    };
  }

}
