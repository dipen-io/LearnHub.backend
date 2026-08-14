// src/common/interceptors/response-time.interceptor.ts
// response-time.interceptor.ts

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest();
    const path = request.url;
    const method = request.method;

    return next.handle().pipe(
      map((response) => {
        const rawTime = Date.now() - now;
        const responseTime = rawTime < 1000
          ? `${rawTime}ms`
          : `${(rawTime / 1000).toFixed(2)}s`;
        const requestedAt = new Intl.DateTimeFormat('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(new Date());

        return {
          ...response,
           responseTime,
           requestedAt,
           path,
           method,

        };
      }),
    );
  }
}

