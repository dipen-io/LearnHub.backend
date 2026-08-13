import {
  IsEmail,
  IsOptional,
  IsString,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
  ValidationOptions,
  IsIn,
} from 'class-validator';

/**
 * Custom validator that ensures either email or phone number is provided,
 * based on the 'method' value.
 */
@ValidatorConstraint({ async: false })
class EmailOrPhoneConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const { email, phoneNumber, method } = args.object as any;

    if (method === 'email') {
      return !!email;
    }

    if (method === 'phone') {
      return !!phoneNumber;
    }

    return false; // method is invalid or not matched
  }

  defaultMessage(_: ValidationArguments) {
    return 'Email is required when method is "email", and phone number is required when method is "phone"';
  }
}

function IsEmailOrPhone(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isEmailOrPhone',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: EmailOrPhoneConstraint,
    });
  };
}

export class SendOtpDto {
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

  @IsEmailOrPhone()
  private readonly _validatePresence?: any; // Triggers cross-field validation
}
