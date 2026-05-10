import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// This file configures the Drizzle ORM connection
// It should only be used in server-side contexts or edge functions,
// not directly in Next.js client components in a static export.

const connectionString = process.env.DATABASE_URL || '';

// Disable prefetch for Serverless/Edge deployments
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
