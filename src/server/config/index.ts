import dotenv from 'dotenv';

dotenv.config();

export const config = {
  server: {
    port: process.env.PORT || 4000,
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
  },
  database: {
    url: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/forum'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'development-secret-key',
    expiresIn: '24h'
  }
}; 