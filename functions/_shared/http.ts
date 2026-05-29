import { ZodError } from "zod";

export function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...init?.headers,
    },
  });
}

export function errorResponse(message: string, status = 400, details?: unknown) {
  return jsonResponse({ ok: false, error: message, details }, { status });
}

export function getErrorMessage(error: unknown, fallback = "Unexpected error.") {
  if (error instanceof ZodError) return error.issues[0]?.message ?? fallback;
  if (error instanceof Error) return error.message;
  return fallback;
}

export function zodDetails(error: unknown) {
  return error instanceof ZodError ? error.flatten() : undefined;
}

export function statusFromError(error: unknown) {
  return error instanceof ZodError ? 422 : 400;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function readJsonObject(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) throw new Error("Content-Type must be application/json.");

  const body: unknown = await request.json();
  if (!isRecord(body)) throw new Error("JSON body must be an object.");
  return body;
}

export function paramValue(params: EventContext<unknown, string, unknown>["params"], key: string) {
  const value = params[key];
  return typeof value === "string" ? value : Array.isArray(value) ? value[0] : "";
}

export function allowMethods(methods: string[]) {
  return new Response(null, {
    status: 204,
    headers: { allow: methods.join(", ") },
  });
}
