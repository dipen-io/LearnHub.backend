// course/dto/create-course.dto.ts

import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsDateString,
  Min,
  MaxLength,
  IsArray,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

// export enum CourseStatus {
//   UPCOMING = 'upcoming',
//   ONGOING = 'ongoing',
//   COMPLETED = 'completed',
//   DRAFT = 'draft',
// }

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export class CreateCourseDto {
  @IsNotEmpty({ message: 'Course Title is required' })
  @IsString()
  courseTitle: string;

  // @IsOptional()
  // @IsString({ message: 'Slug must be a string' })
  // slug?: string;

  @IsOptional()
  @IsString()
  courseThumbnail: string;

  // @IsOptional()
  // @IsEnum(CourseStatus, { message: 'Invalid course status' })
  // status: CourseStatus;


  @IsOptional()
  @IsEnum(CourseLevel, { message: 'Level must be beginner, intermediate, or advanced' })
  level: CourseLevel;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => (typeof value === 'string' ? value.split(',') : value))
  tags?: string[];

  @IsOptional()
  price?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Discount must be a number' })
  @Min(0, { message: 'Discount cannot be negative' })
  discount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Description is too long' })
  description?: string;

  @IsOptional()
  @IsString()
  requirements?: string;

  @IsOptional()
  @IsString()
  whatYouWillLearn?: string;

  @IsOptional()
  @IsString()
  promoVideoUrl?: string;

  @IsOptional()
  categoryId?: string | number;

  @IsOptional()
  @IsString()
  isFree?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Published date must be a valid ISO date string' })
  publishedAt?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Enrollment deadline must be a valid ISO date string' })
  enrollmentDeadline?: string;
}

