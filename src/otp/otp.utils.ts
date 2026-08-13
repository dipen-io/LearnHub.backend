//src/otp/utils.otp.ts
export function generateOtp(length: number) {
    return Array.from({length}, () => Math.floor(Math.random() * 10 )).join('');
} 

export function getOtpExpiry(minutes: number) {
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    return now;
} 
