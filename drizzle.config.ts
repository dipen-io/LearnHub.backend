import { env } from 'src/config/env.config';
import * as dotenv from 'dotenv';
dotenv.config();

const dbUrl =
  env.NODE_ENV === 'development' ? env.LOCAL_DB_URL : env.DATABASE_URL;

export default {
  out: './drizzle',
  dialect: 'postgresql',
  schema: './src/schema',

  dbCredentials: {
    // url: env.LOCAL_DB_URL, // if u want to migrate Locally then add env.LOCAL_DB_URL
    url: dbUrl,
  },

  extensionsFilters: ['postgis'],
  schemaFilter: 'public',
  tablesFilter: '*',

  introspect: {
    casing: 'camel',
  },

  migrations: {
    prefix: 'timestamp',
    table: '__drizzle_migrations__',
    schema: 'public',
  },

  entities: {
    roles: {
      provider: '',
      exclude: [],
      include: [],
    },
  },

  breakpoints: true,
  strict: true,
  verbose: true,
};
