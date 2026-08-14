import { IsEmail, IsIn, IsOptional, IsString } from "class-validator";

export class OtpVerificationDto {
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  phoneNumber?: string;

  @IsIn(['email', 'phone'], {
    message: 'Method must be either "email" or "phone"',
  })
  method: 'email' | 'phone';
}

export class OtpVerify {
  @IsString({message: "OTP is required"})
  otp: string;
}
