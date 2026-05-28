import { and, eq, isNull } from "drizzle-orm";
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

async function isSlugAvailable(db: ManiacDatabase, userId: string, slug: string, ignoreEquipmentId?: string) {
  const rows = await db
    .select({ id: equipments.id })
    .from(equipments)
    .where(and(eq(equipments.userId, userId), eq(equipments.slug, slug), isNull(equipments.deletedAt)))
    .limit(1);

  const existing = rows[0];
  return !existing || existing.id === ignoreEquipmentId;
}

async function createAvailableSlug(db: ManiacDatabase, userId: string, baseSlug: string, ignoreEquipmentId?: string) {
  const normalizedBase = slugify(baseSlug);

  for (let suffix = 0; suffix < 50; suffix += 1) {
    const slug = suffix === 0 ? normalizedBase : `${normalizedBase}-${suffix + 1}`;
    if (await isSlugAvailable(db, userId, slug, ignoreEquipmentId)) return slug;
  }

  return `${normalizedBase}-${Date.now().toString(36)}`;
}

export async function createEquipment(db: ManiacDatabase, userId: string, input: unknown) {
  const parsed = createEquipmentSchema.parse(input);
  const id = createId("eq");
  const slug = await createAvailableSlug(db, userId, parsed.slug ?? parsed.nickname);

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
  const { id, slug, ...values } = parsed;
  const nextSlug = slug ? await createAvailableSlug(db, userId, slug, id) : undefined;

  await db
    .update(equipments)
    .set({ ...values, ...(nextSlug ? { slug: nextSlug } : {}), updatedAt: new Date() })
    .where(and(eq(equipments.id, id), eq(equipments.userId, userId), isNull(equipments.deletedAt)));

  return { id, userId, slug: nextSlug };
}

export async function softDeleteEquipment(db: ManiacDatabase, userId: string, equipmentId: string) {
  await db
    .update(equipments)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(equipments.id, equipmentId), eq(equipments.userId, userId), isNull(equipments.deletedAt)));

  return { id: equipmentId };
}
