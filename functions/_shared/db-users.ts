import { MOCK_USER_ID } from "./dev-user";

export async function ensureDevUser(db: D1Database) {
  const statement = db.prepare("INSERT OR IGNORE INTO users (id, email, nickname, provider) VALUES (?, ?, ?, ?)");
  await statement.bind(MOCK_USER_ID, "dev@maniac-garage.local", "Dev Maniac", "mock").run();
}
