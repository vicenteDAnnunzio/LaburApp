import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  databaseUrl: process.env.DATABASE_URL || '',

  // JWT
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // CORS
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};

// Validations
if (!config.databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

if (!config.jwtSecret || config.jwtSecret === 'your-super-secret-jwt-key-change-this-in-production') {
  console.warn('⚠️  WARNING: Using default JWT_SECRET. Change this in production!');
}
