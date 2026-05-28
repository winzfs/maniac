import { and, desc, eq, isNull } from "drizzle-orm";
import { equipments } from "@/server/db/schema";
import type { ManiacDatabase } from "@/server/db/client";
import type { EquipmentListFilter } from "../types";

export async function listOwnerEquipments(db: ManiacDatabase, filter: EquipmentListFilter) {
  if (!filter.userId) return [];

  return db
    .select()
    .from(equipments)
    .where(and(eq(equipments.userId, filter.userId), isNull(equipments.deletedAt)))
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

export async function getPublicEquipmentBySlug(db: ManiacDatabase, userId: string, slug: string) {
  const rows = await db
    .select()
    .from(equipments)
    .where(and(eq(equipments.userId, userId), eq(equipments.slug, slug), eq(equipments.visibility, "public"), eq(equipments.moderationStatus, "normal"), isNull(equipments.deletedAt)))
    .limit(1);

  return rows[0] ?? null;
}
