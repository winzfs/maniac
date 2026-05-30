/// <reference types="@cloudflare/workers-types" />

export type ImageProviderName = "cloudinary" | "supabase" | "r2" | "external_url";

export type ImageStorageEnv = {
  IMAGE_STORAGE_PROVIDER?: string;
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;
  CLOUDINARY_UPLOAD_FOLDER?: string;
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
  width?: number;
  height?: number;
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

function removeImageExtension(objectKey: string) {
  return objectKey.replace(/\.[a-z0-9]+$/i, "");
}

function toHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha1Hex(value: string) {
  const encoded = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-1", encoded);
  return toHex(hash);
}

function buildSignatureBase(params: Record<string, string | number | boolean>) {
  return Object.entries(params)
    .filter(([, value]) => value !== "" && value !== undefined && value !== null)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
}

export class CloudinaryImageStorageProvider implements ImageStorageProvider {
  readonly provider = "cloudinary" as const;
  private readonly cloudName: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly uploadFolder: string;

  constructor(env: ImageStorageEnv) {
    if (!env.CLOUDINARY_CLOUD_NAME) throw new Error("CLOUDINARY_CLOUD_NAME is not configured.");
    if (!env.CLOUDINARY_API_KEY) throw new Error("CLOUDINARY_API_KEY is not configured.");
    if (!env.CLOUDINARY_API_SECRET) throw new Error("CLOUDINARY_API_SECRET is not configured.");

    this.cloudName = env.CLOUDINARY_CLOUD_NAME;
    this.apiKey = env.CLOUDINARY_API_KEY;
    this.apiSecret = env.CLOUDINARY_API_SECRET;
    this.uploadFolder = env.CLOUDINARY_UPLOAD_FOLDER || "maniac";
  }

  getPublicUrl(objectKey: string) {
    return `https://res.cloudinary.com/${encodeURIComponent(this.cloudName)}/image/upload/${encodeObjectKey(objectKey)}`;
  }

  async put(input: PutImageInput) {
    const publicId = `${this.uploadFolder}/${removeImageExtension(input.objectKey)}`;
    const timestamp = Math.floor(Date.now() / 1000);
    const signatureParams = { overwrite: true, public_id: publicId, timestamp };
    const signature = await sha1Hex(`${buildSignatureBase(signatureParams)}${this.apiSecret}`);
    const formData = new FormData();

    formData.set("file", input.file);
    formData.set("api_key", this.apiKey);
    formData.set("timestamp", String(timestamp));
    formData.set("public_id", publicId);
    formData.set("overwrite", "true");
    formData.set("signature", signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(this.cloudName)}/image/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json().catch(() => null) as { secure_url?: string; public_id?: string; width?: number; height?: number; error?: { message?: string } } | null;

    if (!response.ok || !data?.secure_url || !data.public_id) {
      throw new Error(`Cloudinary upload failed: ${response.status} ${data?.error?.message ?? ""}`.trim());
    }

    return {
      provider: this.provider,
      bucket: this.cloudName,
      objectKey: data.public_id,
      publicUrl: data.secure_url,
      width: data.width,
      height: data.height,
    };
  }
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
  if (env.IMAGE_STORAGE_PROVIDER === "supabase") return new SupabaseImageStorageProvider(env);
  if (env.IMAGE_STORAGE_PROVIDER === "cloudinary" || env.CLOUDINARY_CLOUD_NAME) return new CloudinaryImageStorageProvider(env);
  return new SupabaseImageStorageProvider(env);
}

export function createImageObjectKey(input: { userId: string; purpose: string; originalName?: string; contentType: string }) {
  const extensionFromName = input.originalName?.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
  const extensionFromType = input.contentType === "image/png" ? "png" : input.contentType === "image/webp" ? "webp" : input.contentType === "image/gif" ? "gif" : "jpg";
  const extension = extensionFromName || extensionFromType;
  return `${input.purpose}/${input.userId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
}
