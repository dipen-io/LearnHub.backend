export interface ICourses {
    id: number;
    courseName: string;
    courseTitle: string,
    courseThumbnail: string;
    tags: string[] | null;
    price: number | null;
    discount: number | null;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface courseFilter {
    categoryId?: string;
    level?: 'beginner' | 'intermediate' | 'advanced' | 'all';
      // You could add more here, like `isFree: boolean`
}
