import { Request, Body, Controller, Post, UseFilters, Injectable, HttpCode, HttpStatus, Res, UseGuards, Get, Req } from '@nestjs/common';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
// import { SendOtpDto } from './dto/sendOtpDto';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from 'src/users/user.dto';
import { UserService } from 'src/users/user.service';
import type { Response ,  Request as EReq} from 'express';
import { AuthGuard } from './auth.guard';
import { updatePasswordDto } from 'src/users/DTO/user.dto';
import { OtpVerificationDto, OtpVerify } from './dto/otpVerificationDto';
import { InstructorRequestDto } from './dto/instructorDto';
import * as request_interface from 'src/common/interface/request_interface';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from 'src/common/dto/response.dto';
import { cleanNullUndefined } from 'src/common/filters/null-undefined.filter';


@Injectable()
@Controller('auth')
@UseFilters(HttpExceptionFilter)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService) { }

  // @Post('send-otp')
  // sendOtp(@Body() dto: SendOtpDto) {
  //   return this.authService.sendOtp(dto);
  // }

  @Post('/create-new-user')
  async createUsers(@Res({ passthrough: true }) res: Response, @Body() createUserDto: CreateUserDto) {
    // const user = await  this.userService.create(createUserDto);
    const { safeUser, accessToken, refreshToken } = await this.userService.create(createUserDto)

    const formatedResponse = plainToInstance(UserResponseDto, safeUser, {
        excludeExtraneousValues: true,
    })

    //Set refreshToken as HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, //false for localhost, true in production
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return {
      status: 'success',
      message: 'user created successfully',
      data: safeUser,
      accessToken: accessToken,
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('/login')
  async loginUsers(@Res({ passthrough: true }) res: Response, @Body() loginUserDto: LoginUserDto) {
    const { safeUser, accessToken, refreshToken } = await this.userService.login(loginUserDto)

    const formatedResponse = plainToInstance(UserResponseDto, safeUser, {
        excludeExtraneousValues: true,
    })

    //Set refreshToken as HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, //false for localhost, true in production
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return {
      success: true,
      message: 'user login successfully',
      data: cleanNullUndefined(formatedResponse),
      accessToken: accessToken,
    };
  }

  // @UseGuards(AuthGuard , RolesGuard)
  @UseGuards(AuthGuard)
  // @Roles(userRole.Instructor) //TODO: Removes this
  @Get("me")
  async profile(@Request() req: request_interface.RequestWithUser) {
    const userId = req.user.userId;
    return await this.userService.profile(userId);
  }

  //Forgot-Password

  /*
   * Receive email from body
   * check if emial exist
   * Generate a secure  token (UUID,JWT, or random string)
   * Save the resetPasswordToken with expireResetPasswordToken
   * Send Email https://yourdomain.com/reset-password?token=abc123
   */

  //Reset-Password

  /*
   * Receive token and newPassword token
   * find user by refreshToken from db
   * hash check token is valid or expired
   * hash new password
   * update new password
   * invalid the refreshToken
  */

  //me/password
  /*
   * using authGuard
   * Receive newPassword, oldPassword
   * compare current password
   * hash the new password and save
   */

  // return await this.userService.profile(userId);
  @UseGuards(AuthGuard)
  @Post("me/password")
  async updatePassword(
    @Req() req: request_interface.RequestWithUser,
    @Body() updatePasswordDto: updatePasswordDto,
  ) {
    const userId: number = req.user.userId;
    return await this.userService.updateProfile(updatePasswordDto, userId);
  }

  // send-verify-code-for student verfication
  @UseGuards(AuthGuard)
  @Post("/send-verification-code")
  async sendVerficationCode(
    @Req() req: request_interface.RequestWithUser,
    @Body() otpVerifyCode: OtpVerificationDto) {
    const userId: number = req.user.userId;
    return await this.authService.otpVerifyCodeSend(otpVerifyCode, userId)
  }

  // send-verify-code-for student verfication
  @UseGuards(AuthGuard)
  @Post("/otp-verify")
  async OtpVerfication(
    @Req() req: request_interface.RequestWithUser,
    @Body() otpVerify: OtpVerify): Promise<any> {
    const userId: number = req.user.userId;
    try {
      return await this.authService.otpVerify(otpVerify, userId);
    } catch (err: any) {
      return {
        success: false,
        error: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          type: err?.name || 'Error',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          message: err?.message || 'Something went wrong',
          // stack: err?.stack,
        },
      };
    }
  }

  //Instructor Requst
  @UseGuards(AuthGuard)
  @Post('/instructor-request')
  async requestInstructor(@Req() req: request_interface.RequestWithUser,
    @Body() dto: InstructorRequestDto): Promise<any> {
    const userId = req.user.userId;
    return await this.authService.requestInstructor(dto, userId)
  }

    // Generate new accesstoken by refreshing in this route
    @Post('refresh-token')
    async refreshToken(@Req() req: EReq, @Res({ passthrough: true }) res: Response) {
        const tokens = await this.authService.refreshToken(req, res);
        return {
            success: true,
            accessToken: tokens.accessToken,
            data: tokens.data,
        };
    }

}
