export async function hasEquipment(db: D1Database, equipmentId: string, userId: string) {
  const row = await db
    .prepare("SELECT id FROM equipments WHERE id = ? AND user_id = ? AND deleted_at IS NULL LIMIT 1")
    .bind(equipmentId, userId)
    .first<{ id: string }>();

  return Boolean(row);
}

export async function hasMaintenanceLog(db: D1Database, equipmentId: string, logId: string) {
  const row = await db
    .prepare("SELECT id FROM maintenance_logs WHERE id = ? AND equipment_id = ? AND deleted_at IS NULL LIMIT 1")
    .bind(logId, equipmentId)
    .first<{ id: string }>();

  return Boolean(row);
}

export async function hasPart(db: D1Database, equipmentId: string, partId: string) {
  const row = await db
    .prepare("SELECT id FROM parts WHERE id = ? AND equipment_id = ? AND deleted_at IS NULL LIMIT 1")
    .bind(partId, equipmentId)
    .first<{ id: string }>();

  return Boolean(row);
}
