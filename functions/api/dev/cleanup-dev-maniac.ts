/// <reference types="@cloudflare/workers-types" />

type Env = { DB: D1Database };

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function message(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  if (!env.DB) return json({ ok: false, error: "D1 binding DB is not configured." }, 500);

  try {
    const now = Date.now();

    const devUsers = await env.DB.prepare(
      `SELECT id, nickname
       FROM users
       WHERE id = 'dev_user_maniac'
          OR lower(nickname) IN ('dev maniac', 'dev manic')`,
    ).all<{ id: string; nickname: string }>();

    const userIds = (devUsers.results ?? []).map((user) => user.id);
    if (userIds.length === 0) {
      return json({ ok: true, message: "No Dev Maniac user/content found.", users: [], postsUpdated: 0, commentsUpdated: 0 });
    }

    const placeholders = userIds.map(() => "?").join(", ");

    const commentsResult = await env.DB.prepare(
      `UPDATE comments
       SET deleted_at = ?, updated_at = ?
       WHERE deleted_at IS NULL
         AND author_id IN (${placeholders})`,
    ).bind(now, now, ...userIds).run();

    const postsResult = await env.DB.prepare(
      `UPDATE posts
       SET deleted_at = ?, updated_at = ?
       WHERE deleted_at IS NULL
         AND author_id IN (${placeholders})`,
    ).bind(now, now, ...userIds).run();

    return json({
      ok: true,
      message: "Dev Maniac posts/comments were hidden with soft delete.",
      users: devUsers.results ?? [],
      postsUpdated: postsResult.meta.changes ?? 0,
      commentsUpdated: commentsResult.meta.changes ?? 0,
    });
  } catch (error) {
    return json({ ok: false, error: message(error) }, 500);
  }
};

export const onRequestPost = onRequestGet;
