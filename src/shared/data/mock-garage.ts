export type MockMaintenanceLog = {
  id: string;
  type: string;
  title: string;
  performedAt: string;
  usageMetricValue: number;
  cost?: number;
  description: string;
};

export type MockPart = {
  id: string;
  category: string;
  brand: string;
  name: string;
  installedAt: string;
};

export type MockEquipment = {
  id: string;
  slug: string;
  nickname: string;
  category: string;
  brand: string;
  model: string;
  year: number;
  usageMetricType: string;
  usageMetricValue: number;
  description: string;
  ownerName: string;
  themeLabel: string;
  logs: MockMaintenanceLog[];
  parts: MockPart[];
};

export const mockEquipments: MockEquipment[] = [
  {
    id: "eq_ninja400",
    slug: "ninja-400",
    nickname: "Weekend Ninja",
    category: "motorcycle",
    brand: "Kawasaki",
    model: "Ninja 400",
    year: 2021,
    usageMetricType: "km",
    usageMetricValue: 18230,
    description: "주말 투어링과 출퇴근을 함께 책임지는 바이크. 정비 이력과 튜닝 기록을 차곡차곡 쌓는 중입니다.",
    ownerName: "minsu",
    themeLabel: "Garage Portfolio",
    logs: [
      {
        id: "log_oil",
        type: "engine_oil",
        title: "엔진오일 교체",
        performedAt: "2026-05-20",
        usageMetricValue: 18230,
        cost: 72000,
        description: "Motul 7100 10W-40 교체. 다음 교체는 21,000km 근처로 예정.",
      },
      {
        id: "log_chain",
        type: "chain",
        title: "체인 클리닝 및 장력 점검",
        performedAt: "2026-04-10",
        usageMetricValue: 17680,
        description: "체인 클리너와 루브 작업. 장력은 정상 범위.",
      },
      {
        id: "log_tire",
        type: "tire",
        title: "리어 타이어 교체",
        performedAt: "2026-03-02",
        usageMetricValue: 16890,
        cost: 185000,
        description: "Michelin Road 6로 교체. 투어링 안정성 위주 세팅.",
      },
    ],
    parts: [
      { id: "part_exhaust", category: "exhaust", brand: "Akrapovic", name: "Slip-On Line", installedAt: "2025-11-18" },
      { id: "part_tire", category: "tire", brand: "Michelin", name: "Road 6", installedAt: "2026-03-02" },
      { id: "part_pad", category: "brake", brand: "Brembo", name: "Sport Pad", installedAt: "2025-12-20" },
    ],
  },
];

export const getMockEquipmentBySlug = (slug: string) => mockEquipments.find((equipment) => equipment.slug === slug);
