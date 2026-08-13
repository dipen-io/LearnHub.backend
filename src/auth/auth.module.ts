import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/users/user.module';
import { ConfigModule } from '@nestjs/config';
import { env } from 'src/config/env.config';
import { AuthGuard } from './auth.guard';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [EmailModule,
    forwardRef(() => UserModule),
    JwtModule.register({
      secret: env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
    ConfigModule, // optional but good if you use config in this module
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard,
    ],
  exports: [AuthService, AuthGuard, JwtModule],
})
export class AuthModule {}

