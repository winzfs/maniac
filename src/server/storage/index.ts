export type StorageObjectInput = { key: string; data: ArrayBuffer; contentType: string };
export interface StorageProvider { put(input: StorageObjectInput): Promise<{ key: string; url?: string }>; delete(key: string): Promise<void>; }
export class NoopStorageProvider implements StorageProvider { async put(input: StorageObjectInput) { return { key: input.key }; } async delete(_key: string) { } }
