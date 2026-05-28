export type EquipmentCategorySlug = "motorcycle" | "pc" | "keyboard" | "bicycle" | "camera" | "camping" | "audio" | "custom";

export type CategoryBoard = {
  slug: string;
  title: string;
  description: string;
  type: "showcase" | "maintenance" | "parts" | "qna" | "trade";
  postCount: number;
};

export type EquipmentCategory = {
  slug: EquipmentCategorySlug;
  label: string;
  shortLabel: string;
  description: string;
  accent: string;
  boards: CategoryBoard[];
};

const commonBoards = (prefix: string): CategoryBoard[] => [
  { slug: `${prefix}-showcase`, title: "장비 자랑", description: "내 장비 사진과 세팅을 공유하는 공간", type: "showcase", postCount: 18 },
  { slug: `${prefix}-maintenance`, title: "정비/관리 기록", description: "정비 이력, 관리 팁, 소모품 교체 경험", type: "maintenance", postCount: 12 },
  { slug: `${prefix}-parts`, title: "부품/튜닝 리뷰", description: "사용한 부품, 튜닝 파츠, 만족도 리뷰", type: "parts", postCount: 9 },
  { slug: `${prefix}-qna`, title: "질문/상담", description: "구매, 세팅, 관리에 대한 질문 게시판", type: "qna", postCount: 7 },
];

export const equipmentCategories: EquipmentCategory[] = [
  { slug: "motorcycle", label: "바이크", shortLabel: "Bike", description: "오토바이 정비, 튜닝, 투어링 기록을 모아보세요.", accent: "Garage Orange", boards: [...commonBoards("motorcycle"), { slug: "motorcycle-trade", title: "중고 부품", description: "바이크 부품 거래 준비 게시판", type: "trade", postCount: 3 }] },
  { slug: "pc", label: "커스텀 PC", shortLabel: "PC", description: "부품 조합, 벤치마크, 수랭/쿨링 관리 기록.", accent: "Electric Blue", boards: commonBoards("pc") },
  { slug: "keyboard", label: "기계식 키보드", shortLabel: "Keys", description: "키캡, 스위치, 윤활, 흡음 빌드 로그.", accent: "Metal Purple", boards: commonBoards("keyboard") },
  { slug: "bicycle", label: "자전거", shortLabel: "Cycle", description: "라이딩 장비, 소모품, 피팅과 정비 기록.", accent: "Racing Lime", boards: commonBoards("bicycle") },
  { slug: "camera", label: "카메라", shortLabel: "Camera", description: "바디, 렌즈, 악세서리와 촬영 세팅 아카이브.", accent: "Graphite", boards: commonBoards("camera") },
  { slug: "camping", label: "캠핑 장비", shortLabel: "Camp", description: "텐트, 랜턴, 박스, 주방 장비 세팅 기록.", accent: "Oil Green", boards: commonBoards("camping") },
  { slug: "audio", label: "오디오", shortLabel: "Audio", description: "헤드폰, 스피커, DAC, 앰프 조합 기록.", accent: "Graphite", boards: commonBoards("audio") },
  { slug: "custom", label: "기타 장비", shortLabel: "Custom", description: "나만의 취미 장비와 관리 기록을 자유롭게 남기세요.", accent: "Graphite", boards: commonBoards("custom") },
];

export function getEquipmentCategory(slug: string) {
  return equipmentCategories.find((category) => category.slug === slug);
}
