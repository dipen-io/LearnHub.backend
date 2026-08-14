import { Controller, Get, Delete, Post, Body, Query, Param, Patch } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { CreateCategoryDto } from "./Dto/category.dto";
import { CategoryFilterDto } from "./Dto/findAllCategoryQueryDto";
import { UpdateCategoryDto } from "./Dto/updateCategoryDto";

@Controller('category')
export class CategoryController {
    constructor(private categoryService: CategoryService) {}

    @Get()
    async findAll(
        @Query() query: CategoryFilterDto
    ) {
        return this.categoryService.findAll(query);
    }

    @Post('new')
    async create(
        @Body() createServiceDto: CreateCategoryDto) {
        return this.categoryService.create(createServiceDto);
    }

    @Get('single/:id')
    async findOne(@Param('id') id: string) {
        return this.categoryService.findOne(id)
    }

    @Patch('update/:id')
    async updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
        return this.categoryService.update(id, dto)
    }

    @Delete('remove/:id')
    async deleteCategory(@Param('id') id: string ) {
        return this.categoryService.remove(id);
    }
}
