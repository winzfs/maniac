export type PublicEquipmentRow = {
  id: string;
  user_id: string;
  category: string;
  brand: string | null;
  model: string | null;
  nickname: string;
  slug: string;
  year: number | null;
  description: string | null;
  main_image_url: string | null;
  usage_metric_type: string;
  usage_metric_value: number | null;
  visibility: string;
  moderation_status: string;
  created_at: number;
};

export type PublicMaintenanceLogRow = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  performed_at: number;
  usage_metric_value: number | null;
  cost: number | null;
  shop_name: string | null;
  visibility: string;
};

export type PublicPartRow = {
  id: string;
  category: string;
  brand: string | null;
  name: string;
  price: number | null;
  installed_at: number | null;
  purchase_url: string | null;
  image_url: string | null;
  memo: string | null;
  visibility: string;
};

const publicEquipmentSelect = "id, user_id, category, brand, model, nickname, slug, year, description, main_image_url, usage_metric_type, usage_metric_value, visibility, moderation_status, created_at";

export async function findPublicEquipment(db: D1Database, slug: string) {
  return db.prepare(
    `SELECT ${publicEquipmentSelect}
     FROM equipments
     WHERE slug = ?
       AND deleted_at IS NULL
       AND visibility = 'public'
       AND moderation_status = 'normal'
     ORDER BY created_at DESC
     LIMIT 1`,
  ).bind(slug).first<PublicEquipmentRow>();
}

export async function findPublicEquipmentById(db: D1Database, id: string) {
  return db.prepare(
    `SELECT ${publicEquipmentSelect}
     FROM equipments
     WHERE id = ?
       AND deleted_at IS NULL
       AND visibility = 'public'
       AND moderation_status = 'normal'
     LIMIT 1`,
  ).bind(id).first<PublicEquipmentRow>();
}

export async function findViewableEquipment(db: D1Database, slug: string, viewerUserId?: string | null) {
  if (!viewerUserId) return findPublicEquipment(db, slug);

  return db.prepare(
    `SELECT ${publicEquipmentSelect}
     FROM equipments
     WHERE slug = ?
       AND deleted_at IS NULL
       AND (
         (visibility = 'public' AND moderation_status = 'normal')
         OR user_id = ?
       )
     ORDER BY CASE WHEN user_id = ? THEN 0 ELSE 1 END, created_at DESC
     LIMIT 1`,
  ).bind(slug, viewerUserId, viewerUserId).first<PublicEquipmentRow>();
}

export async function findViewableEquipmentById(db: D1Database, id: string, viewerUserId?: string | null) {
  if (!viewerUserId) return findPublicEquipmentById(db, id);

  return db.prepare(
    `SELECT ${publicEquipmentSelect}
     FROM equipments
     WHERE id = ?
       AND deleted_at IS NULL
       AND (
         (visibility = 'public' AND moderation_status = 'normal')
         OR user_id = ?
       )
     LIMIT 1`,
  ).bind(id, viewerUserId).first<PublicEquipmentRow>();
}

export async function findViewableEquipmentByIdentifier(db: D1Database, identifier: string, viewerUserId?: string | null) {
  const byId = await findViewableEquipmentById(db, identifier, viewerUserId);
  if (byId) return byId;
  return findViewableEquipment(db, identifier, viewerUserId);
}

export async function listPublicEquipmentLogs(db: D1Database, equipmentId: string, viewerUserId?: string | null) {
  const equipment = viewerUserId
    ? await db.prepare("SELECT user_id FROM equipments WHERE id = ? AND deleted_at IS NULL LIMIT 1").bind(equipmentId).first<{ user_id: string }>()
    : null;
  const isOwner = Boolean(viewerUserId && equipment?.user_id === viewerUserId);

  const rows = await db.prepare(
    `SELECT id, type, title, description, performed_at, usage_metric_value, cost, shop_name, visibility
     FROM maintenance_logs
     WHERE equipment_id = ? AND deleted_at IS NULL AND (? = 1 OR visibility = 'public')
     ORDER BY performed_at DESC, created_at DESC
     LIMIT 20`,
  ).bind(equipmentId, isOwner ? 1 : 0).all<PublicMaintenanceLogRow>();

  return rows.results ?? [];
}

export async function listPublicEquipmentParts(db: D1Database, equipmentId: string, viewerUserId?: string | null) {
  const equipment = viewerUserId
    ? await db.prepare("SELECT user_id FROM equipments WHERE id = ? AND deleted_at IS NULL LIMIT 1").bind(equipmentId).first<{ user_id: string }>()
    : null;
  const isOwner = Boolean(viewerUserId && equipment?.user_id === viewerUserId);

  const rows = await db.prepare(
    `SELECT id, category, brand, name, price, installed_at, purchase_url, image_url, memo, visibility
     FROM parts
     WHERE equipment_id = ? AND deleted_at IS NULL AND (? = 1 OR visibility = 'public')
     ORDER BY installed_at DESC, created_at DESC
     LIMIT 20`,
  ).bind(equipmentId, isOwner ? 1 : 0).all<PublicPartRow>();

  return rows.results ?? [];
}
