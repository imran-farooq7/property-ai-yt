import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './db';

const connectionString = process.env.DATABASE_URL!;
const queryClient = postgres(connectionString, {
    prepare: false,
    connect_timeout: 10,
});

export const db = drizzle(queryClient, { schema });
export * from './db';
