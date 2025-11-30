// utils/prismaClient.js

const { PrismaClient } = require('@prisma/client');

let prisma;

if (process.env.NODE_ENV === 'production') {
    // En producción, inicializa una instancia normal
    prisma = new PrismaClient();
} else {
    // En desarrollo, usa una instancia global para evitar crear demasiadas conexiones
    if (!global.prisma) {
        global.prisma = new PrismaClient();
    }
    prisma = global.prisma;
}

// Exporta la instancia del cliente de Prisma para que otros archivos la usen
module.exports = prisma;