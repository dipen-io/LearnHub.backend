import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  profilePicture: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth: string;

  @IsOptional()
  @IsString()
  state: string;
}

@ValidatorConstraint({ name: 'emailOrPhoneRequired', async: false })
class EmailOrPhoneRequired implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const { email, phoneNumber } = args.object as any;
    return !!email || !!phoneNumber;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Either email or phone number must be provided';
  }
}

export class LoginUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  phoneNumber?: string;

  @Validate(EmailOrPhoneRequired)
  dummyField: string; // Just to trigger the custom validator

  @IsString({ message: 'Password must be a string' })
  password: string;
}

export class updatePasswordDto {

  @IsString({ message: 'new password must be a string' })
  newPassword?: string;

  @IsString({ message: 'Password must be a string' })
  password: string;
}
