import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AppConfig } from 'src/config/app.config';
import { HealthModule } from 'src/health/health.module';
import { loggerConfig } from 'src/config/logger.config';
import { LoggerModule } from 'nestjs-pino';
import { UserModule } from './users/user.module';
import { AuthModule } from './auth/auth.module';
import { db } from './config/db';
import { JwtModule } from '@nestjs/jwt';
import { env } from './config/env.config';
import { CourseModule } from './course/course.module';
import { AdminModule } from './admin/admin.module';
import { CartModule } from './cart/cart.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [AppConfig],
    }),

    JwtModule.register({
      secret: env.JWT_ACCESS_SECRET,
      signOptions: {expiresIn: "15m" },
    }),

    HealthModule,
    LoggerModule.forRootAsync(loggerConfig),
    UserModule,
    AuthModule,
    CourseModule,
    AdminModule,
    CartModule,
    WishlistModule,
    CategoryModule,
  ],
  controllers: [],
  providers: [
    {
      provide: 'DATABASE',
      useValue: db,
    },
  ],
    exports:[JwtModule]
})
export class AppModule {}
