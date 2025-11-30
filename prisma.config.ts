// prisma.config.ts
import { defineConfig } from 'prisma/config';

// Este archivo le dice a Prisma dónde encontrar la URL de la base de datos
export default defineConfig({
  datasources: {
    db: {
      // Leemos la variable DATABASE_URL de tu archivo .env
      url: process.env.DATABASE_URL, 
    },
  },
});