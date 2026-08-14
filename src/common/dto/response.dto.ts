//src/common/dto/response.dto.ts
import { Exclude, Expose, Transform } from "class-transformer";

export class UserResponseDto {
    @Expose()
    id: number;

    @Expose()
    email?: string;

    @Expose()
    fullName?: string;

    @Expose()
    phoneNumber?: string;

    @Expose()
    role?: string;

    @Expose()
    isVerified?: boolean;

    @Expose()
    emailVerified?: boolean;

    @Expose()
    @Transform(({ value }) => (value === null || value === undefined ? undefined : value), {
       toPlainOnly: true
    })
    profilePicture?: string;

    @Exclude()
    password: string;


    constructor(partial: Partial<UserResponseDto>){
        Object.assign(this, partial)
    }
}
