# Backend Technologins

- Nestjs
- Drizzle
- PostgreSql

# packages

- @nestjs/config
  For loading and using .env configuration variables

### ✅ Validation

- class-validator
  Adds validation decorators like @IsEmail() for DTOs
- class-transformer
  Converts plain objects to class instances (and vice versa)

### 📚 API Documentation

- @nestjs/swagger
  NestJS integration with Swagger/OpenAPI
- swagger-ui-express
  Serves the Swagger UI at /api endpoint

### 🔐 Authentication

- @nestjs/jwt
  JWT support in NestJS (sign, verify tokens)
- @nestjs/passport
  PassportJS integration with NestJS
- passport-jwt
  Passport strategy for JWT (used by AuthGuard)
- passport
  The base Passport library (required by others)

### Other packages

- Redis Caching
  cache-manager, ioredis
- File Uploads
  multer
- Logging
  winston or pino
- Background Jobs
  @nestjs/bull, bull

### 🔥 OPTIONAL UTILITIES

- uuid Unique ID generation
- dayjs, date-fns, moment Date/time manipulation
- dotenv Load .env files manually if needed
- faker, @faker-js/faker Fake data for testing/dev
- lodash, lodash-es Utility functions
- axios HTTP client (good for microservices)
- cross-env
