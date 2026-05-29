/// <reference types="@cloudflare/workers-types" />

export type ImageProviderName = "supabase" | "r2" | "external_url";

export type ImageStorageEnv = {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  SUPABASE_STORAGE_BUCKET?: string;
  SUPABASE_PUBLIC_STORAGE_BASE_URL?: string;
};

export type PutImageInput = {
  objectKey: string;
  file: Blob;
  contentType: string;
  cacheControl?: string;
};

export type PutImageResult = {
  provider: ImageProviderName;
  bucket: string;
  objectKey: string;
  publicUrl: string;
};

export interface ImageStorageProvider {
  readonly provider: ImageProviderName;
  put(input: PutImageInput): Promise<PutImageResult>;
  getPublicUrl(objectKey: string): string;
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function encodeObjectKey(objectKey: string) {
  return objectKey.split("/").map(encodeURIComponent).join("/");
}

export class SupabaseImageStorageProvider implements ImageStorageProvider {
  readonly provider = "supabase" as const;
  private readonly url: string;
  private readonly serviceRoleKey: string;
  private readonly bucket: string;
  private readonly publicBaseUrl?: string;

  constructor(env: ImageStorageEnv) {
    if (!env.SUPABASE_URL) throw new Error("SUPABASE_URL is not configured.");
    if (!env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");

    this.url = trimTrailingSlash(env.SUPABASE_URL);
    this.serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
    this.bucket = env.SUPABASE_STORAGE_BUCKET || "maniac-images";
    this.publicBaseUrl = env.SUPABASE_PUBLIC_STORAGE_BASE_URL ? trimTrailingSlash(env.SUPABASE_PUBLIC_STORAGE_BASE_URL) : undefined;
  }

  getPublicUrl(objectKey: string) {
    if (this.publicBaseUrl) return `${this.publicBaseUrl}/${encodeObjectKey(objectKey)}`;
    return `${this.url}/storage/v1/object/public/${encodeURIComponent(this.bucket)}/${encodeObjectKey(objectKey)}`;
  }

  async put(input: PutImageInput) {
    const endpoint = `${this.url}/storage/v1/object/${encodeURIComponent(this.bucket)}/${encodeObjectKey(input.objectKey)}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.serviceRoleKey}`,
        apikey: this.serviceRoleKey,
        "content-type": input.contentType,
        "cache-control": input.cacheControl || "public, max-age=31536000, immutable",
        "x-upsert": "true",
      },
      body: input.file,
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`Supabase Storage upload failed: ${response.status} ${detail}`.trim());
    }

    return {
      provider: this.provider,
      bucket: this.bucket,
      objectKey: input.objectKey,
      publicUrl: this.getPublicUrl(input.objectKey),
    };
  }
}

export function createImageStorageProvider(env: ImageStorageEnv): ImageStorageProvider {
  return new SupabaseImageStorageProvider(env);
}

export function createImageObjectKey(input: { userId: string; purpose: string; originalName?: string; contentType: string }) {
  const extensionFromName = input.originalName?.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
  const extensionFromType = input.contentType === "image/png" ? "png" : input.contentType === "image/webp" ? "webp" : input.contentType === "image/gif" ? "gif" : "jpg";
  const extension = extensionFromName || extensionFromType;
  return `${input.purpose}/${input.userId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
}
