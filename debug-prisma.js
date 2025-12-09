
require('dotenv').config();
const { PrismaPostgresAdapter } = require('@prisma/adapter-ppg');
const { PrismaClient } = require('@prisma/client');

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Defined' : 'Undefined');

try {
    const adapter = new PrismaPostgresAdapter({
        connectionString: process.env.DATABASE_URL
    });
    console.log('Adapter created successfully');
} catch (e) {
    console.error('Error creating adapter:', e);
}
