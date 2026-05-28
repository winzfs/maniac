import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export type ManiacDatabase = ReturnType<typeof createDb>;

export function createDb(database: D1Database) {
  return drizzle(database, { schema });
}

export type DatabaseProvider = {
  DB: D1Database;
};
