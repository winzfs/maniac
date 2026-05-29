/// <reference types="@cloudflare/workers-types" />

type Env = {
  DB: D1Database;
};

type EquipmentRow = {
  id: string;
  category: string;
  brand: string | null;
  model: string | null;
  nickname: string;
  slug: string;
  year: number | null;
  description: string | null;
  usage_metric_type: string;
  usage_metric_value: number | null;
  visibility: string;
  moderation_status: string;
  created_at: number;
};

type MaintenanceLogRow = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  performed_at: number;
  usage_metric_value: number | null;
  cost: number | null;
  shop_name: string | null;
  visibility: string;
};

type PartRow = {
  id: string;
  category: string;
  brand: string | null;
  name: string;
  price: number | null;
  installed_at: number | null;
  purchase_url: string | null;
  image_url: string | null;
  memo: string | null;
  visibility: string;
};

const MOCK_USER_ID = "dev_user_maniac";

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function decodeSlug(slug: string) {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

function formatDate(ms: number) {
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(ms));
}

function htmlResponse(body: string, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function renderNotFound(slug: string) {
  return htmlResponse(`<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>장비를 찾을 수 없음 · Maniac Garage</title>
  <style>
    body{margin:0;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#f7f4ef;color:#171717;display:grid;min-height:100vh;place-items:center;padding:24px}
    main{max-width:520px;border:1px solid #ddd3c4;background:#fffaf2;border-radius:28px;padding:28px;box-shadow:0 20px 60px rgba(0,0,0,.08)}
    h1{margin:0 0 12px;font-size:28px} p{line-height:1.7;color:#5f5a52} a{color:#e6531f;font-weight:800}
  </style>
</head>
<body>
  <main>
    <h1>장비를 찾을 수 없습니다.</h1>
    <p><b>${escapeHtml(slug)}</b> slug의 장비가 아직 없거나 비공개 상태입니다.</p>
    <p><a href="/garage/new/">장비 다시 등록하기</a> · <a href="/garage/">내 차고로 이동</a></p>
  </main>
</body>
</html>`, 404);
}

function renderLogs(logs: MaintenanceLogRow[]) {
  if (logs.length === 0) {
    return `<p>아직 공개된 정비 기록이 없습니다.</p>`;
  }

  return `<div class="timeline">
    ${logs.map((log) => {
      const usage = log.usage_metric_value != null ? `${log.usage_metric_value.toLocaleString()} km` : "";
      const cost = log.cost != null ? `${log.cost.toLocaleString()}원` : "";
      const shop = log.shop_name ? escapeHtml(log.shop_name) : "";
      const meta = [usage, cost, shop].filter(Boolean).join(" · ");

      return `<article class="log-card">
        <p class="log-meta">${escapeHtml(log.type)} · ${escapeHtml(formatDate(log.performed_at))}</p>
        <h3>${escapeHtml(log.title)}</h3>
        ${log.description ? `<p class="log-desc">${escapeHtml(log.description)}</p>` : ""}
        ${meta ? `<p class="log-sub">${meta}</p>` : ""}
      </article>`;
    }).join("")}
  </div>`;
}

function renderParts(parts: PartRow[]) {
  if (parts.length === 0) {
    return `<p>아직 공개된 부품 기록이 없습니다.</p>`;
  }

  return `<div class="parts-grid">
    ${parts.map((part) => {
      const title = [part.brand, part.name].filter(Boolean).join(" ");
      const installed = part.installed_at != null ? formatDate(part.installed_at) : "설치일 미입력";
      const price = part.price != null ? `${part.price.toLocaleString()}원` : "가격 미입력";
      const link = part.purchase_url ? `<a class="part-link" href="${escapeHtml(part.purchase_url)}" rel="nofollow noopener" target="_blank">구매 링크</a>` : "";
      const image = part.image_url ? `<img src="${escapeHtml(part.image_url)}" alt="${escapeHtml(title)}" loading="lazy" />` : `<div class="part-placeholder">PART</div>`;

      return `<article class="part-card">
        <div class="part-image">${image}</div>
        <div class="part-body">
          <p class="log-meta">${escapeHtml(part.category)} · ${escapeHtml(installed)}</p>
          <h3>${escapeHtml(title)}</h3>
          ${part.memo ? `<p class="log-desc">${escapeHtml(part.memo)}</p>` : ""}
          <p class="log-sub">${escapeHtml(price)}</p>
          ${link}
        </div>
      </article>`;
    }).join("")}
  </div>`;
}

function renderEquipment(row: EquipmentRow, logs: MaintenanceLogRow[], parts: PartRow[]) {
  const spec = [row.brand, row.model, row.year].filter(Boolean).join(" · ");
  const usage = row.usage_metric_value ? `${row.usage_metric_value.toLocaleString()} ${row.usage_metric_type}` : "사용량 미입력";

  return htmlResponse(`<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(row.nickname)} · Maniac Garage</title>
  <style>
    :root{color-scheme:light;--bg:#f7f4ef;--surface:#fffaf2;--text:#171717;--muted:#6f6a62;--border:#ddd3c4;--orange:#e6531f;--graphite:#171717}
    *{box-sizing:border-box} body{margin:0;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:var(--bg);color:var(--text)}
    main{width:min(960px,100%);margin:0 auto;padding:24px 20px 56px}.top{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:28px}.brand{font-weight:900;letter-spacing:-.03em}.pill{border:1px solid var(--border);border-radius:999px;padding:10px 14px;text-decoration:none;color:var(--text);font-weight:800;background:rgba(255,255,255,.56)}
    .hero{border:1px solid var(--border);border-radius:36px;background:linear-gradient(135deg,#fffaf2,#f0e7d8);padding:28px;overflow:hidden}.eyebrow{display:inline-flex;border-radius:999px;background:var(--graphite);color:white;padding:8px 12px;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.12em}.title{font-size:clamp(38px,10vw,80px);line-height:.92;letter-spacing:-.07em;margin:20px 0 14px}.desc{max-width:720px;color:var(--muted);font-size:16px;line-height:1.75}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:22px}.card{border:1px solid var(--border);background:rgba(255,255,255,.68);border-radius:24px;padding:18px}.label{font-size:12px;color:var(--muted);font-weight:800;text-transform:uppercase;letter-spacing:.12em}.value{margin-top:8px;font-size:18px;font-weight:900}.banner{height:240px;border-radius:30px;background:radial-gradient(circle at 20% 20%,#ff8a4c,transparent 30%),linear-gradient(135deg,#28221f,#5f554a);margin-top:22px;display:grid;place-items:center;color:white;font-size:64px;font-weight:1000;letter-spacing:-.08em}.section{margin-top:22px;border:1px solid var(--border);border-radius:28px;background:var(--surface);padding:22px}.section h2{margin:0 0 8px}.section p{margin:0;color:var(--muted);line-height:1.7}.timeline{display:grid;gap:12px;margin-top:16px}.log-card{border:1px solid var(--border);border-radius:22px;background:rgba(255,255,255,.7);padding:16px}.log-card h3,.part-card h3{margin:4px 0 0;font-size:18px}.log-meta{font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.12em;color:var(--muted)}.log-desc{margin-top:8px!important}.log-sub{margin-top:10px!important;font-size:13px;font-weight:800}.parts-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:16px}.part-card{border:1px solid var(--border);border-radius:24px;background:rgba(255,255,255,.7);overflow:hidden}.part-image{height:150px;background:#e7ded1;display:grid;place-items:center;color:#7a7167;font-weight:1000;letter-spacing:-.05em}.part-image img{width:100%;height:100%;object-fit:cover;display:block}.part-body{padding:16px}.part-link{display:inline-flex;margin-top:12px;color:var(--orange);font-weight:900;text-decoration:none}@media(max-width:640px){.grid,.parts-grid{grid-template-columns:1fr}.hero{padding:22px}.banner{height:180px;font-size:44px}}
  </style>
</head>
<body>
  <main>
    <div class="top">
      <div class="brand">Maniac Garage</div>
      <a class="pill" href="/garage/">내 차고</a>
    </div>
    <section class="hero">
      <span class="eyebrow">${escapeHtml(row.category)}</span>
      <h1 class="title">${escapeHtml(row.nickname)}</h1>
      <p class="desc">${escapeHtml(row.description || "아직 장비 소개가 없습니다.")}</p>
      <div class="banner">GARAGE</div>
      <div class="grid">
        <div class="card"><div class="label">Spec</div><div class="value">${escapeHtml(spec || "스펙 미입력")}</div></div>
        <div class="card"><div class="label">Usage</div><div class="value">${escapeHtml(usage)}</div></div>
        <div class="card"><div class="label">Visibility</div><div class="value">${escapeHtml(row.visibility)}</div></div>
        <div class="card"><div class="label">Slug</div><div class="value">/${escapeHtml(row.slug)}</div></div>
      </div>
    </section>
    <section class="section">
      <h2>정비 타임라인</h2>
      ${renderLogs(logs)}
    </section>
    <section class="section">
      <h2>장착 부품</h2>
      ${renderParts(parts)}
    </section>
  </main>
</body>
</html>`);
}

async function listPublicLogs(env: Env, equipmentId: string) {
  try {
    const rows = await env.DB.prepare(
      `SELECT id, type, title, description, performed_at, usage_metric_value, cost, shop_name, visibility
       FROM maintenance_logs
       WHERE equipment_id = ? AND deleted_at IS NULL AND visibility = 'public'
       ORDER BY performed_at DESC, created_at DESC
       LIMIT 20`,
    ).bind(equipmentId).all<MaintenanceLogRow>();

    return rows.results ?? [];
  } catch {
    return [];
  }
}

async function listPublicParts(env: Env, equipmentId: string) {
  try {
    const rows = await env.DB.prepare(
      `SELECT id, category, brand, name, price, installed_at, purchase_url, image_url, memo, visibility
       FROM parts
       WHERE equipment_id = ? AND deleted_at IS NULL AND visibility = 'public'
       ORDER BY installed_at DESC, created_at DESC
       LIMIT 20`,
    ).bind(equipmentId).all<PartRow>();

    return rows.results ?? [];
  } catch {
    return [];
  }
}

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  if (!env.DB) return htmlResponse("D1 binding DB is not configured.", 500);

  const rawSlug = typeof params.slug === "string" ? params.slug : Array.isArray(params.slug) ? params.slug[0] : "";
  const slug = decodeSlug(rawSlug);
  if (!slug) return renderNotFound("");

  const result = await env.DB.prepare(
    `SELECT id, category, brand, model, nickname, slug, year, description, usage_metric_type, usage_metric_value, visibility, moderation_status, created_at
     FROM equipments
     WHERE user_id = ? AND slug = ? AND deleted_at IS NULL
     LIMIT 1`,
  ).bind(MOCK_USER_ID, slug).first<EquipmentRow>();

  if (!result) return renderNotFound(slug);

  const [logs, parts] = await Promise.all([
    listPublicLogs(env, result.id),
    listPublicParts(env, result.id),
  ]);

  return renderEquipment(result, logs, parts);
};
