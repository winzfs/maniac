export type PublicPostRef = { id: string };

export async function getPublicPost(db: D1Database, id: string) {
  return db.prepare(
    `SELECT posts.id
     FROM posts
     INNER JOIN boards ON boards.id = posts.board_id
     WHERE posts.id = ?
       AND posts.deleted_at IS NULL
       AND posts.status = 'published'
       AND posts.visibility = 'public'
       AND posts.moderation_status = 'normal'
       AND boards.status = 'active'
       AND boards.permission = 'public'
     LIMIT 1`,
  ).bind(id).first<PublicPostRef>();
}
