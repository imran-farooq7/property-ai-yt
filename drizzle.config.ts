import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: './lib/schema/index.ts',
    out: './drizzle',
    dialect: 'postgresql',
    schemaFilter: ['public'],
    dbCredentials: {
        // Use Session Pooler (port 5432) for DDL / migrations / introspection
        url: (process.env.DATABASE_URL || '').replace(':6543/', ':5432/'),
    },
});
