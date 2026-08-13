// src/common/filters/http-exception.filter.ts

import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(
  HttpException,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const status = exception?.getStatus ? exception.getStatus() : 500;
    const message = exception?.message || 'Internal server error';

    // Handle BadRequestException (Validation Errors)
    if (exception instanceof BadRequestException) {
      return response.status(status).json({
        status: 'error',
        message: 'Validation failed',
        data: null,
        error: exception.getResponse(),
        timestamp: new Date().toISOString(),
      });
    }

    // Handle NotFoundException
    if (exception instanceof NotFoundException) {
      return response.status(status).json({
        status: 'error',
        message: 'Resource not found',
        data: null,
        error: exception.getResponse(),
        timestamp: new Date().toISOString(),
      });
    }

    // Handle UnauthorizedException
    if (exception instanceof UnauthorizedException) {
      return response.status(status).json({
        status: 'error',
        message: 'Unauthorized access',
        data: null,
        error: exception.getResponse(),
        timestamp: new Date().toISOString(),
      });
    }

    // Handle ForbiddenException
    if (exception instanceof ForbiddenException) {
      return response.status(status).json({
        status: 'error',
        message: 'Access forbidden',
        data: null,
        error: exception.getResponse(),
        timestamp: new Date().toISOString(),
      });
    }

    // Default fallback for any other HttpExceptions
    const errorResponse = exception?.response || { message };

    response.status(status).json({
      status: 'error',
      message,
      data: null,
      error: errorResponse,
      timestamp: new Date().toISOString(),
    });
  }
}
