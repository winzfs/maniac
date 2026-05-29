/// <reference types="@cloudflare/workers-types" />

import { requireCurrentUser } from "../../_shared/auth";
import { createImageObjectKey, createImageStorageProvider, type ImageStorageEnv } from "../../_shared/image-storage";
import { errorResponse, getErrorMessage, jsonResponse } from "../../_shared/http";

type Env = ImageStorageEnv & { DB: D1Database; APP_ENV?: string };

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const maxImageBytes = 5 * 1024 * 1024;

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);

  const auth = await requireCurrentUser(request, env);
  if (auth.response) return auth.response;

  try {
    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) return errorResponse("image 파일을 첨부해 주세요.", 400);
    if (!allowedImageTypes.has(image.type)) return errorResponse("jpg, png, webp, gif 이미지만 업로드할 수 있습니다.", 415);
    if (image.size > maxImageBytes) return errorResponse("이미지는 5MB 이하만 업로드할 수 있습니다.", 413);

    const storage = createImageStorageProvider(env);
    const objectKey = createImageObjectKey({
      userId: auth.user.id,
      purpose: "profile",
      originalName: image.name || "profile-image",
      contentType: image.type,
    });

    const uploaded = await storage.put({ objectKey, file: image, contentType: image.type });
    const assetId = `img_${crypto.randomUUID()}`;
    const now = Date.now();

    await env.DB.prepare(
      `INSERT INTO image_assets
       (id, owner_user_id, provider, bucket, object_key, public_url, purpose, mime_type, size_bytes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'profile_image', ?, ?, ?, ?)`,
    ).bind(assetId, auth.user.id, uploaded.provider, uploaded.bucket, uploaded.objectKey, uploaded.publicUrl, image.type, image.size, now, now).run();

    await env.DB.prepare(
      `UPDATE users
       SET profile_image_url = ?, profile_image_asset_id = ?, updated_at = ?
       WHERE id = ? AND deleted_at IS NULL`,
    ).bind(uploaded.publicUrl, assetId, now, auth.user.id).run();

    return jsonResponse({
      ok: true,
      image: {
        id: assetId,
        provider: uploaded.provider,
        bucket: uploaded.bucket,
        object_key: uploaded.objectKey,
        public_url: uploaded.publicUrl,
        purpose: "profile_image",
        mime_type: image.type,
        size_bytes: image.size,
      },
    });
  } catch (error) {
    return errorResponse(getErrorMessage(error, "이미지 업로드에 실패했습니다."), 400);
  }
};
