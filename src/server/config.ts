import { ConnectionOptions } from 'typeorm';

export const config = {
  server: {
    port: process.env.PORT || 4000,
    environment: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  database: {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'modern_forum',
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV !== 'production',
    entities: ['src/server/models/**/*.ts'],
    migrations: ['src/server/migrations/**/*.ts'],
    subscribers: ['src/server/subscribers/**/*.ts'],
  } as ConnectionOptions,
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
}; 