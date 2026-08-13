import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { CreateCategoryDto } from "./Dto/category.dto";
import { db } from "src/config/db";
import { categories } from "src/schema";
import { CategoryFilterDto, columnMap } from "./Dto/findAllCategoryQueryDto";
import { eq, and, sql } from "drizzle-orm";
import { success } from "zod";
import { UpdateCategoryDto } from "./Dto/updateCategoryDto";

@Injectable()
export class CategoryService {

    async create(dto: CreateCategoryDto){

        try {
            const dataToInsert = {
                name: dto.name,
                slug: dto.slug ?? dto.name.toLocaleLowerCase().replace(/\s+/g, '-'),
                description: dto.description
            }
            const [category] = await db.insert(categories).values(dataToInsert).returning();
            return {success: true, message: "Created Category Succussfully!"}

        } catch (error) {
            throw new InternalServerErrorException("Failed to create category");
        }
    }

    async findAll(filter: CategoryFilterDto){
        try {

            const {search, page = 1, limit = 50, slug, sortBy = 'createdAt', sortOrder= 'asc'} = filter;
            const whereConditions: any[] = [];
            if (search) {
                whereConditions.push(
                  sql `categories.name ILIKE ${'%' + search + '%'} OR categories.description ILIKE ${'%' + search + '%'}`
                );
            }

            if (slug) {
                whereConditions.push(sql`categories.slug = ${slug}`);
            }
            const offset = (page - 1) * limit;

            // total count for paginations
            const [{ count }] = await db
                .select({count: sql`count(*)`})
                .from(categories)
                .where(whereConditions.length ? and(...whereConditions) : undefined);

            const dbSortBy = columnMap[sortBy] || 'created_at';

            const data = await db
                .select()
                .from(categories)
                .where(whereConditions.length ? and(...whereConditions) : undefined)
                .orderBy(sql`${sql.raw(dbSortBy)} ${sql.raw(sortOrder)}`)
                .limit(limit)
                .offset(offset)

            return {
                success: true,
                message: "Find All Categories!",
                data: data || [],
                total: Number(count),
                page,
                limit
            };
        } catch (error) {
             console.error(error)
             throw new InternalServerErrorException("Failed to fetch categories");
        }
    }

    // Find One Course
    async findOne( id: string ) {
        try {

        const [category] = await db
            .select()
            .from(categories)
            .where(eq(categories.id, id))
            .limit(1);

        if( !category ) {
            throw new NotFoundException(`Category with id ${id} not found`);
        }

        return {
            success: true,
            message: "find single course",
            data: category,
        }
     } catch (error) {
           console.error(error)
           throw new InternalServerErrorException("Failed to fetch single category");
      }
   }

    // UPDATE COURSE
    async update(id: string, dto: UpdateCategoryDto) {
        try {

          const [updated] = await db
                .update(categories)
                .set(dto)
                .where(eq(categories.id, id))
                .returning();

          if (!updated) {
                throw new NotFoundException(`Category with id ${id} not found`);
           }

           return {success: true, message: "updated course Succussfully!"}

          } catch (error) {
              console.error(error)
              throw new InternalServerErrorException("Failed to fetch single category");
          }
   }

    // REMOVE COURSE
    async remove( id: string ) {
        try {

          const [deleted] = await db
               .delete(categories)
               .where(eq(categories.id, id))
               .returning();

          if (!deleted) {
                throw new NotFoundException(`Category with id ${id} not found`);
           }

           return {success: true, message: "remove course Succussfully!"}

          } catch (error) {
               console.error(error)
               throw new InternalServerErrorException("Failed to delete course");
          }
      }
}
