import { ZodError } from "zod";
import { createEquipment } from "../../src/features/equipment/actions/mutations";
import { createEquipmentSchema } from "../../src/features/equipment/schemas";
import { createDb } from "../../src/server/db/client";

type Env = {
  DB: D1Database;
};

const MOCK_USER_ID = "dev_user_maniac";

function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...init?.headers,
    },
  });
}

function errorResponse(message: string, status = 400, details?: unknown) {
  return jsonResponse({ ok: false, error: message, details }, { status });
}

function getErrorMessage(error: unknown) {
  if (error instanceof ZodError) return error.issues[0]?.message ?? "Invalid equipment input.";
  if (error instanceof Error) return error.message;
  return "Unexpected error.";
}

async function readJson(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error("Content-Type must be application/json.");
  }

  return request.json();
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);

  try {
    const body = await readJson(request);
    const input = createEquipmentSchema.parse(body);
    const db = createDb(env.DB);
    const result = await createEquipment(db, MOCK_USER_ID, input);

    return jsonResponse({
      ok: true,
      equipment: result,
      nextPath: `/garage/${result.slug}/`,
      authMode: "mock-user",
    }, { status: 201 });
  } catch (error) {
    const status = error instanceof ZodError ? 422 : 400;
    return errorResponse(getErrorMessage(error), status, error instanceof ZodError ? error.flatten() : undefined);
  }
};

export const onRequest: PagesFunction<Env> = async ({ request }) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        allow: "POST, OPTIONS",
      },
    });
  }

  return errorResponse("Method not allowed.", 405);
};
