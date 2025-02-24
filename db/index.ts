import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

async function main() {
  const client = postgres(process.env.SUPABASE_PG_URL!);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const db = drizzle(client, { casing: 'snake_case', logger: true });
}

main();
