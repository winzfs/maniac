export type PublicEquipmentRow = {
  id: string;
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

export async function findPublicEquipment(db: D1Database, slug: string) {
  return db.prepare(
    `SELECT id, category, brand, model, nickname, slug, year, description, main_image_url, usage_metric_type, usage_metric_value, visibility, moderation_status, created_at
     FROM equipments
     WHERE slug = ?
       AND deleted_at IS NULL
       AND visibility = 'public'
       AND moderation_status = 'normal'
     ORDER BY created_at DESC
     LIMIT 1`,
  ).bind(slug).first<PublicEquipmentRow>();
}

export async function listPublicEquipmentLogs(db: D1Database, equipmentId: string) {
  const rows = await db.prepare(
    `SELECT id, type, title, description, performed_at, usage_metric_value, cost, shop_name, visibility
     FROM maintenance_logs
     WHERE equipment_id = ? AND deleted_at IS NULL AND visibility = 'public'
     ORDER BY performed_at DESC, created_at DESC
     LIMIT 20`,
  ).bind(equipmentId).all<PublicMaintenanceLogRow>();

  return rows.results ?? [];
}

export async function listPublicEquipmentParts(db: D1Database, equipmentId: string) {
  const rows = await db.prepare(
    `SELECT id, category, brand, name, price, installed_at, purchase_url, image_url, memo, visibility
     FROM parts
     WHERE equipment_id = ? AND deleted_at IS NULL AND visibility = 'public'
     ORDER BY installed_at DESC, created_at DESC
     LIMIT 20`,
  ).bind(equipmentId).all<PublicPartRow>();

  return rows.results ?? [];
}
