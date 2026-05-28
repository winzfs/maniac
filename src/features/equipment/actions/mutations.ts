import { and, eq } from "drizzle-orm";
import { createEquipmentSchema, updateEquipmentSchema } from "../schemas";
import { equipments } from "@/server/db/schema";
import type { ManiacDatabase } from "@/server/db/client";

function createId(prefix: string) {
  const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}_${random}`;
}

function slugify(input: string) {
  const slug = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

  return slug || "equipment";
}

export async function createEquipment(db: ManiacDatabase, userId: string, input: unknown) {
  const parsed = createEquipmentSchema.parse(input);
  const id = createId("eq");
  const slug = parsed.slug || slugify(parsed.nickname);

  await db.insert(equipments).values({
    id,
    userId,
    category: parsed.category,
    brand: parsed.brand,
    model: parsed.model,
    nickname: parsed.nickname,
    slug,
    year: parsed.year,
    description: parsed.description,
    mainImageUrl: parsed.mainImageUrl,
    usageMetricType: parsed.usageMetricType,
    usageMetricValue: parsed.usageMetricValue,
    visibility: parsed.visibility,
    moderationStatus: "normal",
  });

  return { id, slug };
}

export async function updateEquipment(db: ManiacDatabase, userId: string, input: unknown) {
  const parsed = updateEquipmentSchema.parse(input);
  const { id, ...values } = parsed;

  await db.update(equipments).set({ ...values, updatedAt: new Date() }).where(and(eq(equipments.id, id), eq(equipments.userId, userId)));

  return { id, userId };
}

export async function softDeleteEquipment(db: ManiacDatabase, userId: string, equipmentId: string) {
  await db.update(equipments).set({ deletedAt: new Date(), updatedAt: new Date() }).where(and(eq(equipments.id, equipmentId), eq(equipments.userId, userId)));
  return { id: equipmentId };
}
