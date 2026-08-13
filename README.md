## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

$ npm install

## supabase
```bash
# Direct apply to database
$ npx drizzle-kit push  Or (npm run generate:migration)

# generate migration sql file
$ npx drizzle-kit generate

# generate migration sql file(apply to db)
$ npm run migrate:remote  

# Locally
# Run docker 
$ docker-compose up -d 
$ npx drizzle-kit generate Or (npm run generate:migration)
# migrate the local  
$ npm run migrate:local 

## Compile and run the project

# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

> pgcli -h localhost -U myuser -d mydb
> pass: mypassword

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
