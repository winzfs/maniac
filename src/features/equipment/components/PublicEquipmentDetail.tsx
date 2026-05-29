type PublicEquipment = {
  id: string;
  category: string;
  brand: string | null;
  model: string | null;
  nickname: string;
  slug: string;
  year: number | null;
  description: string | null;
  main_image_url: string | null;
  usage_metric_type: string;
  usage_metric_value: number | null;
  visibility: string;
};

type PublicMaintenanceLog = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  performed_at: number;
  usage_metric_value: number | null;
  cost: number | null;
  shop_name: string | null;
};

type PublicPart = {
  id: string;
  category: string;
  brand: string | null;
  name: string;
  price: number | null;
  installed_at: number | null;
  purchase_url: string | null;
  image_url: string | null;
  memo: string | null;
};

export type PublicEquipmentDetailData = {
  equipment: PublicEquipment;
  logs: PublicMaintenanceLog[];
  parts: PublicPart[];
};

function formatDate(ms: number | null) {
  if (ms == null) return "날짜 미입력";
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(ms));
}

function formatUsage(equipment: PublicEquipment) {
  if (equipment.usage_metric_value == null) return "사용량 미입력";
  return `${equipment.usage_metric_value.toLocaleString()} ${equipment.usage_metric_type}`;
}

function formatSpec(equipment: PublicEquipment) {
  return [equipment.brand, equipment.model, equipment.year].filter(Boolean).join(" · ") || "스펙 미입력";
}

function formatMoney(value: number | null) {
  if (value == null) return "가격 미입력";
  return `${value.toLocaleString()}원`;
}

export function PublicEquipmentDetail({ equipment, logs, parts }: PublicEquipmentDetailData) {
  return (
    <main className="container-shell space-y-6 py-5 sm:py-8 lg:space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-surface to-background p-5 shadow-soft sm:p-8 lg:rounded-[2.5rem]">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-stretch">
          <div>
            <span className="inline-flex rounded-full bg-graphite px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-white">
              {equipment.category}
            </span>
            <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.9] tracking-[-0.08em] sm:text-7xl lg:text-8xl">
              {equipment.nickname}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-text-secondary">
              {equipment.description || "아직 장비 소개가 없습니다."}
            </p>
          </div>
          <div className="min-h-64 overflow-hidden rounded-[1.75rem] border border-border bg-zinc-200 lg:min-h-full">
            {equipment.main_image_url ? (
              <img className="h-full min-h-64 w-full object-cover" src={equipment.main_image_url} alt={equipment.nickname} />
            ) : (
              <div className="flex h-full min-h-64 items-center justify-center bg-[radial-gradient(circle_at_20%_20%,#ff8a4c,transparent_30%),linear-gradient(135deg,#28221f,#5f554a)] text-5xl font-black tracking-[-0.08em] text-white">
                GARAGE
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-border bg-white/60 p-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-text-secondary">Spec</p>
            <p className="mt-2 font-bold">{formatSpec(equipment)}</p>
          </div>
          <div className="rounded-3xl border border-border bg-white/60 p-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-text-secondary">Usage</p>
            <p className="mt-2 font-bold">{formatUsage(equipment)}</p>
          </div>
          <div className="rounded-3xl border border-border bg-white/60 p-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-text-secondary">Visibility</p>
            <p className="mt-2 font-bold">{equipment.visibility}</p>
          </div>
          <div className="rounded-3xl border border-border bg-white/60 p-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-text-secondary">Slug</p>
            <p className="mt-2 font-bold">/{equipment.slug}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-border bg-surface p-5 sm:p-6">
        <h2 className="text-2xl font-black tracking-[-0.04em]">정비 타임라인</h2>
        {logs.length === 0 ? <p className="mt-3 text-sm text-text-secondary">아직 공개된 정비 기록이 없습니다.</p> : null}
        <div className="mt-4 space-y-3">
          {logs.map((log) => (
            <article key={log.id} className="rounded-3xl border border-border bg-white/60 p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-text-secondary">
                {log.type} · {formatDate(log.performed_at)}
              </p>
              <h3 className="mt-1 text-lg font-black">{log.title}</h3>
              {log.description ? <p className="mt-2 text-sm leading-6 text-text-secondary">{log.description}</p> : null}
              <p className="mt-3 text-xs font-bold text-text-secondary">
                {log.usage_metric_value != null ? `${log.usage_metric_value.toLocaleString()} km` : ""}
                {log.cost != null ? ` · ${log.cost.toLocaleString()}원` : ""}
                {log.shop_name ? ` · ${log.shop_name}` : ""}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-border bg-surface p-5 sm:p-6">
        <h2 className="text-2xl font-black tracking-[-0.04em]">장착 부품</h2>
        {parts.length === 0 ? <p className="mt-3 text-sm text-text-secondary">아직 공개된 부품 기록이 없습니다.</p> : null}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {parts.map((part) => (
            <article key={part.id} className="rounded-3xl border border-border bg-white/60 p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-text-secondary">
                {part.category} · {formatDate(part.installed_at)}
              </p>
              <h3 className="mt-1 text-lg font-black">{part.brand ? `${part.brand} ` : ""}{part.name}</h3>
              {part.memo ? <p className="mt-2 text-sm leading-6 text-text-secondary">{part.memo}</p> : null}
              <p className="mt-3 text-xs font-bold text-text-secondary">{formatMoney(part.price)}</p>
              {part.purchase_url ? (
                <a className="mt-3 inline-flex text-sm font-black text-orange-600" href={part.purchase_url} target="_blank" rel="noreferrer">
                  구매 링크
                </a>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
