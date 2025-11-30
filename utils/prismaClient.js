// utils/prismaClient.js

const { PrismaClient } = require('@prisma/client');

// Inicializa el cliente de Prisma
const prisma = new PrismaClient();

// Exporta la única instancia del cliente
module.exports = prisma;