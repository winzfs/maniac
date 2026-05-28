import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

type D1LikeDatabase = Parameters<typeof drizzle>[0];

export type ManiacDatabase = ReturnType<typeof createDb>;

export function createDb(database: D1LikeDatabase) {
  return drizzle(database, { schema });
}

export type DatabaseProvider = {
  DB: D1LikeDatabase;
};
