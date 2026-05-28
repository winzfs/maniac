import { and, desc, eq, isNull, like, type SQL } from "drizzle-orm";
import { equipments } from "@/server/db/schema";
import type { ManiacDatabase } from "@/server/db/client";
import type { EquipmentListFilter } from "../types";

function compactConditions(conditions: Array<SQL | undefined>) {
  return conditions.filter((condition): condition is SQL => Boolean(condition));
}

export async function listOwnerEquipments(db: ManiacDatabase, filter: EquipmentListFilter) {
  if (!filter.userId) return [];

  const conditions = compactConditions([
    eq(equipments.userId, filter.userId),
    isNull(equipments.deletedAt),
    filter.category ? eq(equipments.category, filter.category) : undefined,
    filter.visibility ? eq(equipments.visibility, filter.visibility) : undefined,
    filter.query ? like(equipments.nickname, `%${filter.query}%`) : undefined,
  ]);

  return db
    .select()
    .from(equipments)
    .where(and(...conditions))
    .orderBy(desc(equipments.createdAt));
}

export async function getOwnerEquipmentById(db: ManiacDatabase, userId: string, equipmentId: string) {
  const rows = await db
    .select()
    .from(equipments)
    .where(and(eq(equipments.id, equipmentId), eq(equipments.userId, userId), isNull(equipments.deletedAt)))
    .limit(1);

  return rows[0] ?? null;
}

export async function getOwnerEquipmentBySlug(db: ManiacDatabase, userId: string, slug: string) {
  const rows = await db
    .select()
    .from(equipments)
    .where(and(eq(equipments.userId, userId), eq(equipments.slug, slug), isNull(equipments.deletedAt)))
    .limit(1);

  return rows[0] ?? null;
}

export async function getPublicEquipmentBySlug(db: ManiacDatabase, userId: string, slug: string) {
  const rows = await db
    .select()
    .from(equipments)
    .where(and(eq(equipments.userId, userId), eq(equipments.slug, slug), eq(equipments.visibility, "public"), eq(equipments.moderationStatus, "normal"), isNull(equipments.deletedAt)))
    .limit(1);

  return rows[0] ?? null;
}
