import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { equipmentCategories } from "@/shared/data/equipment-categories";

const visibilityOptions = [
  { value: "private", label: "비공개", description: "나만 볼 수 있는 관리용 장비입니다." },
  { value: "unlisted", label: "링크 공개", description: "링크를 아는 사람만 볼 수 있습니다." },
  { value: "public", label: "전체 공개", description: "탐색과 공개 페이지에 노출할 수 있습니다." },
];

const usageMetricOptions = [
  { value: "km", label: "km" },
  { value: "hours", label: "hours" },
  { value: "days", label: "days" },
  { value: "custom", label: "custom" },
];

function FieldLabel({ label, description }: { label: string; description?: string }) {
  return (
    <label className="space-y-1 text-sm font-semibold text-text-primary">
      <span>{label}</span>
      {description ? <span className="block text-xs font-normal leading-5 text-text-secondary">{description}</span> : null}
    </label>
  );
}

function inputClassName(className = "") {
  return `h-12 w-full rounded-2xl border border-border bg-surface px-4 text-base text-text-primary outline-none transition placeholder:text-text-secondary/60 focus:border-graphite ${className}`;
}

function textareaClassName(className = "") {
  return `min-h-36 w-full resize-y rounded-2xl border border-border bg-surface px-4 py-3 text-base leading-7 text-text-primary outline-none transition placeholder:text-text-secondary/60 focus:border-graphite ${className}`;
}

export function EquipmentForm() {
  return (
    <form className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <Card className="space-y-6 p-5 sm:p-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold">기본 정보</h2>
          <p className="text-sm leading-6 text-text-secondary">장비 공개 페이지의 제목과 기본 스펙으로 사용됩니다.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <FieldLabel label="장비 이름" description="예: 닌자 400, 내 데스크 셋업, 투어링 자전거" />
            <input className={inputClassName()} name="nickname" placeholder="장비 이름을 입력하세요" required />
          </div>

          <div className="space-y-2">
            <FieldLabel label="카테고리" />
            <select className={inputClassName()} name="category" defaultValue="motorcycle">
              {equipmentCategories.map((category) => (
                <option key={category.slug} value={category.slug}>{category.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <FieldLabel label="공개 상태" />
            <select className={inputClassName()} name="visibility" defaultValue="private">
              {visibilityOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <FieldLabel label="브랜드" />
            <input className={inputClassName()} name="brand" placeholder="Kawasaki" />
          </div>

          <div className="space-y-2">
            <FieldLabel label="모델" />
            <input className={inputClassName()} name="model" placeholder="Ninja 400" />
          </div>

          <div className="space-y-2">
            <FieldLabel label="연식" />
            <input className={inputClassName()} name="year" inputMode="numeric" placeholder="2023" />
          </div>

          <div className="space-y-2">
            <FieldLabel label="사용량" description="바이크는 주행거리, 장비는 사용 시간 등으로 기록합니다." />
            <div className="grid grid-cols-[minmax(0,1fr)_7rem] gap-2">
              <input className={inputClassName()} name="usageMetricValue" inputMode="numeric" placeholder="12800" />
              <select className={inputClassName("px-3")} name="usageMetricType" defaultValue="km">
                {usageMetricOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <FieldLabel label="공개 URL slug" description="비워두면 장비 이름으로 자동 생성됩니다. 실제 저장 연결 후 중복 시 자동 보정됩니다." />
            <input className={inputClassName()} name="slug" placeholder="ninja-400" />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <FieldLabel label="장비 소개" description="공개 페이지 상단에 들어갈 짧은 소개를 작성하세요." />
            <textarea className={textareaClassName()} name="description" placeholder="어떤 장비인지, 어떤 세팅으로 타고/쓰고 있는지 적어보세요." />
          </div>
        </div>
      </Card>

      <aside className="space-y-4 lg:sticky lg:top-6">
        <Card variant="dark" className="space-y-4 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lime-200">Next Step</p>
            <h2 className="mt-2 text-xl font-bold">저장 연결 대기</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-300">현재 화면은 정적 mock 단계입니다. 다음 단계에서 Pages Functions 또는 Workers를 통해 createEquipment mutation에 연결합니다.</p>
          </div>
          <Button className="w-full" type="submit" disabled>저장 기능 준비중</Button>
        </Card>

        <Card className="space-y-3 p-5">
          <h3 className="font-bold">연결 예정 흐름</h3>
          <ol className="space-y-2 text-sm leading-6 text-text-secondary">
            <li>1. 로그인 사용자 확인</li>
            <li>2. form 값을 Zod schema로 검증</li>
            <li>3. createEquipment 실행</li>
            <li>4. /garage/[slug]/ 공개 페이지로 이동</li>
          </ol>
        </Card>

        <Card className="space-y-3 p-5">
          <h3 className="font-bold">이미지 업로드</h3>
          <p className="text-sm leading-6 text-text-secondary">대표 사진과 갤러리는 장비 CRUD 연결 후 R2 업로드 플로우에서 추가합니다.</p>
        </Card>
      </aside>
    </form>
  );
}
