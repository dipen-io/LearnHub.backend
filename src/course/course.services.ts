import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
// import { Course } from "src/schema/type";
import { courseFilter } from "./interfaces/course.interface";
import { CreateCourseDto } from "./dto/create-course.dto";
import { db } from "src/config/db";
import { course, instructorProfiles, users } from "src/schema";
import { eq, and, sql, asc, desc, gt, lt, ilike, gte, or, lte, SQL, } from "drizzle-orm";
import slugify from "slugify";
import { FileService } from "src/file/file.service";
import { CursorPayload } from "./dto/type";
import { AnyPgColumn } from "drizzle-orm/pg-core";

@Injectable()
export class CourseService {
  // private readonly courses: Course;
  constructor(
    private readonly fileService: FileService
  ) { }
  // Get all course
  async getAllCourse(
    limits: string,
    cursors: string,
    sort: string,
    search: string,
    category: string,
    min_price: string,
    max_price: string
  ) {
    const DEFAULT_LIMIT = 10;
    const MAX_LIMIT = 20;

    let limit = parseInt(limits, 10);
    if (isNaN(limit) || limit <= 0) limit = DEFAULT_LIMIT;
    if (limit >= MAX_LIMIT) limit = MAX_LIMIT;

    let cursor: CursorPayload | null = null;
    if (cursors) {
      try {
        cursor = this.decodeCursor(cursors);
      } catch (error) {
        throw new ConflictException("The provider cursor is invalid")
      }
    }

    // Whitelist sortable fiedls
    const SORTABLE_COLUMNS: Record<string, AnyPgColumn> = {
      created_at: course.createdAt,
      price: course.price,
      name: course.courseTitle,
    };

    let sortKey: keyof typeof SORTABLE_COLUMNS = 'created_at';
    let sortDir: 'ASC' | 'DESC' = 'DESC';

    if (sort) {
      const desc_ = sort.startsWith('-');
      const field = (desc_ ? sort.slice(1) : sort) as keyof typeof SORTABLE_COLUMNS;
      if (SORTABLE_COLUMNS[field]) {
        sortKey = field;
        sortDir = desc_ ? 'DESC' : "ASC";
      }
    }

    const sortColoumn: AnyPgColumn = SORTABLE_COLUMNS[sortKey];

    // BUILD WHERE CONDITION
    const conditions = [];

    if (search) {
      // use full-text search or ILIKE
      conditions.push(ilike(course.courseTitle, `%${search}%`));
    }

    if (category) {
      conditions.push(eq(course.categoryId, category));//condusion here 
    }

    if (min_price) {
      conditions.push(gte(course.price, (min_price)));
    }

    if (max_price) {
      conditions.push(lte(course.price, (max_price)));
    }

    if (cursor) {
      const cmp: (column: AnyPgColumn, value: unknown) => SQL = sortDir === 'DESC' ? lt : gt;
      conditions.push(
        or(cmp(sortColoumn, cursor.sortValue)),
        and(eq(sortColoumn, cursor.sortValue), cmp(course.id, cursor.id)),
      );
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;
    const orderFn = sortDir === 'DESC' ? desc : asc;

    // single optimize query
    // filter + sort + cursor + limit + join
    const rows = await db
      .select({
        id: course.id,
        courseTitle: course.courseTitle,
        courseThumbnail: course.courseThumbnail,
        isActive: course.isActive,
        tags: course.tags,
        price: course.price,
        discount: course.discount,
        description: course.description,
        category: course.categoryId,
        createdAt: course.createdAt,
        instructorId: course.instructorId,
        instructorExpertice: instructorProfiles.expertise,
        instructorSocial: instructorProfiles.socialLinks,
        instructorFullName: users.fullName,
      })
      .from(course)
      .innerJoin(instructorProfiles, eq(course.instructorId, instructorProfiles.id))
      .innerJoin(users, eq(instructorProfiles.userId, users.id))
      .where(whereClause)
      .orderBy(orderFn(sortColoumn), orderFn(course.id))
      .limit(limit + 1);



    const has_more = rows.length > limit;
    const trimmed = has_more ? rows.slice(0, limit) : rows;


    const next_cursor =
      trimmed.length > 0
        ? this.encodeCursor({
          id: trimmed[trimmed.length - 1].id,
          sortValue: trimmed[trimmed.length - 1][
            sortKey === 'created_at' ? 'createdAt' : sortKey
          ],
        })
        : null;

    if (trimmed.length === 0) {
      return {
        success: true,
        message: 'No courses are available at the moment . Check back soon!',
        data: [],
        pagination: { next_cursor: null, has_more: false }
      };
    }


    // const courses = await db.query.course.findMany({
    //   with: {
    //     instructor: {
    //       with: {
    //         user: true,
    //       },
    //     },
    //   }
    // })

    // if (!courses || courses.length === 0) {
    //   return {
    //     success: true,
    //     message: "📚 No courses are available at the moment. Check back soon!",
    //     data: [],
    //   };
    // }

    //TODO:
    // while if there is course then
    // i need to check if that course is already in cart or wishlist or not

    // const cleanedCourses = courses.map((course) => ({
    //   id: course.id,
    //   courseTitle: course.courseTitle,
    //   courseThumbnail: course.courseThumbnail,
    //   isActive: course.isActive,
    //   tags: course.tags,
    //   price: course.price,
    //   discount: course.discount,
    //   description: course.description,
    //   instructor: {
    //     instructorId: course.instructor.id,
    //     fullName: course.instructor.user.fullName,
    //     expertise: course.instructor.expertise,
    //     socialLinks: course.instructor.socialLinks,
    //   },
    const cleanedCourses = trimmed.map((c) => ({
      id: c.id,
      courseTitle: c.courseTitle,
      courseThumbnail: c.courseThumbnail,
      isActive: c.isActive,
      tags: c.tags,
      price: c.price,
      discount: c.discount,
      description: c.description,
      instructor: {
        instructorId: c.instructorId,
        fullName: c.instructorFullName,
        expertise: c.instructorExpertice,
        socialLinks: c.instructorSocial
      }
    }));

    return {
      success: true,
      message: 'Fetched All Course',
      data: cleanedCourses,
      pagination: { next_cursor: has_more ? next_cursor : null, has_more },
      applied: {
        search: search || null,
        sort: sort || '-created_at',
        filters: {
          category: category || null,
          min_price: min_price || null,
          max_price: max_price || null,
        },
      },
    };
  }

  // get course by instructor
  async get_course_by_instructor(instructorId: number) {

    const validInstructorId = await db.query.instructorProfiles.findFirst({
      where: eq(instructorProfiles.id, instructorId),
    })

    console.log("INSTRUCTORJ", validInstructorId)

    if (!validInstructorId) {
      throw new NotFoundException("Invalid instructor ID")
    }

    const courses = await db.query.course.findMany({
      where: eq(course.instructorId, instructorId),
      with: {
        instructor: {
          with: {
            user: true,
          }
        }
      }
    })

    console.log("COURSE: ", courses);

    if (!course) {
      throw new NotFoundException("No Course Found");
    }
    return {
      success: true,
      message: "Fetched Course by InstructorId",
      data: courses,
    }
  }

  //create course
  async create_course(createCourseDto: CreateCourseDto, instructorId: number, file?: Express.Multer.File) {
    // Check if the instructorId is valid or not
    const validUserId = await db.query.instructorProfiles.findFirst({
      where: eq(instructorProfiles.id, instructorId),
    })

    if (!validUserId) {
      throw new NotFoundException("Invalid user ID");
    }
    // ✅ Generate slug safely
    const { courseTitle } = createCourseDto
    const folderName = 'courseThumbnails';
    const slug = slugify(courseTitle || 'untitle-course', { lower: true, strict: true })
    // const upload =  file ? await this.fileService.uploadFile(file) : null;
    const upload = file
      ? await this.fileService.uploadFile(file, { folder: folderName })
      : null;

    const isFree = typeof createCourseDto.isFree === 'string'
      ? createCourseDto.isFree.toLowerCase() === 'true'
      : Boolean(createCourseDto.isFree);

    // const courseData = {
    //   instructorId: instructorId,
    //   slug,
    //   ...createCourseDto,
    //   courseThumbnail: upload?.url || upload?.path || "http://urlofimage",
    //   // publishedAt: createCourseDto.publishedAt
    //   //   ? new Date(createCourseDto.publishedAt)
    //   //   : undefined,
    //   // enrollmentDeadline: createCourseDto.enrollmentDeadline
    //   //   ? new Date(createCourseDto.enrollmentDeadline)
    //   //   : undefined,
    //   isFree
    // };
    const courseData = {
      instructorId,
      courseTitle: createCourseDto.courseTitle,
      slug,

      shortDescription: createCourseDto.shortDescription,
      description: createCourseDto.description,

      categoryId: createCourseDto.categoryId,

      level: createCourseDto.level,
      language: createCourseDto.language,

      tags: createCourseDto.tags,

      price: createCourseDto.price,

      isFree,

      courseThumbnail:
        upload?.url ||
        upload?.path ||
        "http://urlofimage",
    };

    try {
      const savedData = await db.transaction(async (tx) => {
        const [createdCourse] = await tx.insert(course).values(courseData).returning();
        return createdCourse;
      })
      return {
        success: true,
        message: "Course Created Successfully!",
        data: savedData,
      }
    } catch (error: any) {
      if (upload?.path) {
        await this.fileService.deleteFile(upload.path).catch(() => {
          // don't let cleanup failure mask the original error 
        });
      }

      if (error?.code === "23505") {
        throw new ConflictException(
          "A course with this title already exists"
        );
      }
      throw error;
    }
  }

  // Get single courses

  // Delete course
  async delete_course(courseId: string) {
    const validCourseId = await db.query.course.findFirst({
      where: eq(course.id, courseId),
    })

    if (!validCourseId) {
      throw new NotFoundException("Invalid Course ID");
    }

    await db.delete(course).where(eq(course.id, courseId));

    return {
      success: true,
      message: 'Course deleted successfully',
    };
  }
  // Update course

  //Search Course
  async searchCourses(searchText: string | null, filters: courseFilter) {
    const conditions = [eq(course.isActive, true)];

    if (searchText) {
      // conditions.push(
      //   sql`courses.search_text_vector @@ websearch_to_tsquery('english', ${searchText})`
      // );
      conditions.push(
        sql`courses.search_vector @@ websearch_to_tsquery('english', ${searchText})`
      );
    }

    if (filters.categoryId) {
      conditions.push(eq(course.categoryId, filters.categoryId));
    }

    if (filters.level && filters.level !== 'all') {
      conditions.push(eq(course.level, filters.level));
    }

    const searchResult = await db
      .select()
      .from(course)
      .where(and(...conditions))
      .limit(50);

    return {
      success: true,
      message: "Course Search Successfully!",
      data: searchResult,
    };
  }


  // ENCODE CURSOR 
  encodeCursor(payload: CursorPayload) {
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  // DECODE CURSOR
  decodeCursor(cursorStr: string): CursorPayload {
    const decoded = Buffer.from(cursorStr, 'base64').toString('utf-8');
    const parsed = JSON.parse(decoded);
    if (parsed.id === undefined || parsed.sortValue === undefined) throw new Error('Malformed cursor');
    return parsed;
  }


}
