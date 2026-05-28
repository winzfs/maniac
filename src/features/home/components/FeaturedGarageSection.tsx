import { Card } from "@/shared/components/ui/Card";
import { HorizontalScroller } from "@/shared/components/ui/HorizontalScroller";
import { SectionHeader } from "@/shared/components/ui/SectionHeader";

const featured = [{ name: "Triumph Street Triple", tag: "Roadster" }, { name: "Yamaha MT-09", tag: "Naked" }, { name: "Ninja 400", tag: "Garage Log" }];

export function FeaturedGarageSection() {
  return (
    <section>
      <SectionHeader title="Featured Garage" description="장비 포트폴리오 미리보기" />
      <HorizontalScroller>
        {featured.map((item) => (
          <Card key={item.name} className="min-w-64 sm:min-w-72">
            <div className="h-36 rounded-xl bg-zinc-200 sm:h-40" />
            <h3 className="mt-3 font-semibold">{item.name}</h3>
            <p className="text-sm text-text-secondary">{item.tag}</p>
          </Card>
        ))}
      </HorizontalScroller>
    </section>
  );
}
