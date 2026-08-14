import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class GetUserQueryDto {
    @IsOptional()
    @IsString()
    search?: string = "";

    @IsOptional()
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @IsInt()
    @Min(1)
    limit?: number = 30;

    @IsOptional()
    @IsString()
    type?: 'users' | 'students';

    @IsOptional()
    @IsString()
    status?: 'active' | 'inactive';
}

