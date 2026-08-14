// Define the possible validation outcomes
export enum OTPValidationResult {
  VALID = 'VALID',
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_USED = 'ALREADY_USED',
  EXPIRED = 'EXPIRED',
}

import { and, eq, InferSelectModel } from 'drizzle-orm';
import { otp } from 'src/schema/otp';

// Infer the select model type for the 'otp' table
type SelectOTP = InferSelectModel<typeof otp>;

export class OTPValidation {
  constructor(private db: typeof import('src/config/db').db) {}

  async validateOTP(
    userId: string | number,
    otpCode: string,
  ): Promise<OTPValidationResult> {
    // 👈 Change return type to the enum
    const numericUserId =
      typeof userId === 'string' ? parseInt(userId, 10) : userId;

    const [userOtp] = await this.db
      .select()
      .from(otp)
      .where(and(eq(otp.userId, numericUserId), eq(otp.otp, otpCode)));

    const selectedOtp = userOtp;

    // 1. Check if OTP exists
    if (!selectedOtp) {
      return OTPValidationResult.NOT_FOUND; // 👈 New specific response
    }

    // 2. Check if OTP has been used
    if (selectedOtp.usedAt !== null) {
      return OTPValidationResult.ALREADY_USED; // 👈 New specific response
    }

    // 3. Check if OTP has expired
    if (new Date() > new Date(selectedOtp.expiresAt)) {
      // NOTE: This should technically also handle the "expired" response from the database query itself
      return OTPValidationResult.EXPIRED; // 👈 New specific response
    }

    // If all checks pass, mark as used and return success
    await this.db
      .update(otp)
      .set({ usedAt: new Date() })
      .where(eq(otp.id, selectedOtp.id));

    return OTPValidationResult.VALID; // 👈 New specific response
  }
}
