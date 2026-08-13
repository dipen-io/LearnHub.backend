import { IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CategoryFilterDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @IsNumber()
    @Min(1)
    limit?: number = 100;

    @IsOptional()
    @IsString()
    slug?: string;

    @IsOptional()
    @IsString()
    sortBy?: 'name' | 'createdAt' = 'createdAt';

    @IsOptional()
    @IsString()
    sortOrder?: 'asc' | 'desc' = 'asc';
}

export const columnMap: Record<string, string> = {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  name: 'name',
  slug: 'slug',
};
