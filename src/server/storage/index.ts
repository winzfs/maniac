export type StorageObjectInput = {
  key: string;
  data: ArrayBuffer;
  contentType: string;
  cacheControl?: string;
};

export type StorageObjectResult = {
  key: string;
  url?: string;
};

export interface StorageProvider {
  put(input: StorageObjectInput): Promise<StorageObjectResult>;
  delete(key: string): Promise<void>;
  getPublicUrl?(key: string): string | undefined;
}

export class NoopStorageProvider implements StorageProvider {
  async put(input: StorageObjectInput) {
    return { key: input.key };
  }

  async delete(_key: string) {}
}

export class R2StorageProvider implements StorageProvider {
  constructor(private readonly bucket: R2Bucket, private readonly publicBaseUrl?: string) {}

  async put(input: StorageObjectInput) {
    await this.bucket.put(input.key, input.data, {
      httpMetadata: { contentType: input.contentType, cacheControl: input.cacheControl },
    });
    return { key: input.key, url: this.getPublicUrl(input.key) };
  }

  async delete(key: string) {
    await this.bucket.delete(key);
  }

  getPublicUrl(key: string) {
    return this.publicBaseUrl ? `${this.publicBaseUrl.replace(/\/$/, "")}/${key}` : undefined;
  }
}
