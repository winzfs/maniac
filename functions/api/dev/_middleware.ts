/// <reference types="@cloudflare/workers-types" />

type Env = {
  APP_ENV?: string;
  DEV_TOOLS_ENABLED?: string;
  DEV_TOOLS_SECRET?: string;
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function isEnabled(env: Env) {
  return env.DEV_TOOLS_ENABLED === "true";
}

function isProduction(env: Env) {
  return env.APP_ENV === "production";
}

function getRequestSecret(request: Request) {
  const url = new URL(request.url);
  return request.headers.get("x-dev-tools-secret") ?? url.searchParams.get("token") ?? "";
}

function isAuthorized(request: Request, env: Env) {
  const configuredSecret = env.DEV_TOOLS_SECRET ?? "";

  if (!configuredSecret) {
    return !isProduction(env);
  }

  return getRequestSecret(request) === configuredSecret;
}

export const onRequest: PagesFunction<Env> = async ({ request, env, next }) => {
  if (!isEnabled(env)) {
    return json({ ok: false, error: "Development API is disabled." }, 404);
  }

  if (!isAuthorized(request, env)) {
    return json({ ok: false, error: "Development API authorization failed." }, 401);
  }

  return next();
};
