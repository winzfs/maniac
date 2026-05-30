/// <reference types="@cloudflare/workers-types" />

import { requireCurrentUser } from "../../_shared/auth";
import { createImageObjectKey, createImageStorageProvider, type ImageStorageEnv } from "../../_shared/image-storage";
import { errorResponse, getErrorMessage, jsonResponse } from "../../_shared/http";

type Env = ImageStorageEnv & { DB: D1Database; APP_ENV?: string };

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const maxImageBytes = 8 * 1024 * 1024;

async function ensureImageSchema(db: D1Database) {
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS image_assets (
      id TEXT PRIMARY KEY NOT NULL,
      owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      provider TEXT NOT NULL,
      bucket TEXT,
      object_key TEXT NOT NULL,
      public_url TEXT NOT NULL,
      purpose TEXT NOT NULL,
      mime_type TEXT,
      size_bytes INTEGER,
      width INTEGER,
      height INTEGER,
      created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
      deleted_at INTEGER
    )`,
  ).run();

  await db.prepare("CREATE INDEX IF NOT EXISTS image_assets_owner_idx ON image_assets (owner_user_id, purpose)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS image_assets_provider_key_idx ON image_assets (provider, bucket, object_key)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS image_assets_deleted_idx ON image_assets (deleted_at)").run();
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);

  const auth = await requireCurrentUser(request, env);
  if (auth.response) return auth.response;

  try {
    await ensureImageSchema(env.DB);

    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) return errorResponse("image 파일을 첨부해 주세요.", 400);
    if (!allowedImageTypes.has(image.type)) return errorResponse("jpg, png, webp, gif 이미지만 업로드할 수 있습니다.", 415);
    if (image.size > maxImageBytes) return errorResponse("이미지는 8MB 이하만 업로드할 수 있습니다.", 413);

    const storage = createImageStorageProvider(env);
    const objectKey = createImageObjectKey({
      userId: auth.user.id,
      purpose: "part",
      originalName: image.name || "part-image",
      contentType: image.type,
    });

    const uploaded = await storage.put({ objectKey, file: image, contentType: image.type });
    const assetId = `img_${crypto.randomUUID()}`;
    const now = Date.now();

    await env.DB.prepare(
      `INSERT INTO image_assets
       (id, owner_user_id, provider, bucket, object_key, public_url, purpose, mime_type, size_bytes, width, height, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'part_image', ?, ?, ?, ?, ?, ?)`,
    ).bind(assetId, auth.user.id, uploaded.provider, uploaded.bucket, uploaded.objectKey, uploaded.publicUrl, image.type, image.size, uploaded.width ?? null, uploaded.height ?? null, now, now).run();

    return jsonResponse({
      ok: true,
      image: {
        id: assetId,
        provider: uploaded.provider,
        bucket: uploaded.bucket,
        object_key: uploaded.objectKey,
        public_url: uploaded.publicUrl,
        purpose: "part_image",
        mime_type: image.type,
        size_bytes: image.size,
        width: uploaded.width ?? null,
        height: uploaded.height ?? null,
      },
    });
  } catch (error) {
    return errorResponse(getErrorMessage(error, "이미지 업로드에 실패했습니다."), 400);
  }
};
