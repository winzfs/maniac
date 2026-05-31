export type EquipmentCategorySlug = "motorcycle" | "pc" | "keyboard" | "bicycle" | "camera" | "camping" | "audio" | "custom";

export type CategoryBoard = {
  slug: string;
  title: string;
  description: string;
  type: "showcase" | "review" | "free" | "qna" | "trade";
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

export type CommunityBoardTopic = {
  slug: CategoryBoard["type"];
  title: string;
  shortLabel: string;
  description: string;
  writeLabel: string;
};

export const communityBoardTopics: CommunityBoardTopic[] = [
  { slug: "showcase", title: "장비 자랑", shortLabel: "자랑", description: "내 장비 사진과 세팅을 공유하는 공간입니다.", writeLabel: "장비 자랑 글쓰기" },
  { slug: "review", title: "리뷰", shortLabel: "리뷰", description: "장비, 부품, 세팅, 사용 경험을 리뷰합니다.", writeLabel: "리뷰 쓰기" },
  { slug: "free", title: "자유", shortLabel: "자유", description: "장비 이야기를 자유롭게 나누는 게시판입니다.", writeLabel: "자유 글쓰기" },
  { slug: "qna", title: "질문·상담", shortLabel: "질문", description: "구매, 세팅, 고장, 관리 방법에 대해 다른 덕후들과 상담합니다.", writeLabel: "질문 올리기" },
  { slug: "trade", title: "중고·나눔", shortLabel: "거래", description: "장비와 부품 거래, 나눔, 구매 희망 글을 모아봅니다.", writeLabel: "거래 글쓰기" },
];

const commonBoards = (prefix: string): CategoryBoard[] => [
  { slug: `${prefix}-showcase`, title: "장비 자랑", description: "내 장비 사진과 세팅을 공유하는 공간", type: "showcase", postCount: 18 },
  { slug: `${prefix}-review`, title: "리뷰", description: "장비, 부품, 세팅, 사용 경험 리뷰", type: "review", postCount: 9 },
  { slug: `${prefix}-free`, title: "자유", description: "장비 이야기를 자유롭게 나누는 공간", type: "free", postCount: 8 },
  { slug: `${prefix}-qna`, title: "질문/상담", description: "구매, 세팅, 관리에 대한 질문 게시판", type: "qna", postCount: 7 },
  { slug: `${prefix}-trade`, title: "중고/나눔", description: "장비와 부품 거래, 나눔 정보", type: "trade", postCount: 3 },
];

export const equipmentCategories: EquipmentCategory[] = [
  { slug: "motorcycle", label: "바이크", shortLabel: "Bike", description: "오토바이 정비, 튜닝, 투어링 기록을 모아보세요.", accent: "Garage Orange", boards: commonBoards("motorcycle") },
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

export function getCommunityBoardTopic(slug: string) {
  return communityBoardTopics.find((topic) => topic.slug === slug);
}

export function topicBoardSlug(categorySlug: string, topicSlug: string) {
  return `${categorySlug}-${topicSlug}`;
}
