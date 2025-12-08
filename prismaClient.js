// prismaClient.js (Asumo que este archivo va en la raíz del proyecto o en una carpeta de configuración)

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = prisma;