
const { PrismaPostgresAdapter } = require('@prisma/adapter-ppg');

console.log('Simulating missing DATABASE_URL');

try {
    const adapter = new PrismaPostgresAdapter({
        connectionString: undefined
    });
    console.log('Adapter created successfully');
} catch (e) {
    console.error('Caught error:', e);
}

try {
    const adapter = new PrismaPostgresAdapter({
        connectionString: null
    });
    console.log('Adapter created successfully with null');
} catch (e) {
    console.error('Caught error with null:', e);
}
