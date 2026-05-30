export type CommunityBoardTopicType = "showcase" | "maintenance" | "parts" | "qna" | "trade" | "free";

export type CommunityBoardTopic = {
  slug: CommunityBoardTopicType;
  title: string;
  shortLabel: string;
  description: string;
  writeLabel: string;
};

export const communityBoardTopics: CommunityBoardTopic[] = [
  {
    slug: "showcase",
    title: "장비 자랑",
    shortLabel: "자랑",
    description: "바이크, 키보드, PC, 카메라 등 내 장비 사진과 세팅을 공유하는 공간입니다.",
    writeLabel: "장비 자랑 글쓰기",
  },
  {
    slug: "maintenance",
    title: "정비·관리",
    shortLabel: "정비",
    description: "정비 이력, 소모품 교체, 관리 팁, 문제 해결 경험을 공유합니다.",
    writeLabel: "정비 기록 쓰기",
  },
  {
    slug: "parts",
    title: "부품·튜닝",
    shortLabel: "부품",
    description: "튜닝 파츠, 부품 교체, 구매 후기, 세팅 변화를 리뷰합니다.",
    writeLabel: "부품 리뷰 쓰기",
  },
  {
    slug: "qna",
    title: "질문·상담",
    shortLabel: "질문",
    description: "구매, 세팅, 고장, 관리 방법에 대해 다른 마니아들과 상담합니다.",
    writeLabel: "질문 올리기",
  },
  {
    slug: "trade",
    title: "중고·나눔",
    shortLabel: "거래",
    description: "장비와 부품 거래, 나눔, 구매 희망 글을 모아봅니다.",
    writeLabel: "거래 글쓰기",
  },
];

export function getCommunityBoardTopic(slug: string) {
  return communityBoardTopics.find((topic) => topic.slug === slug);
}

export function topicBoardSlug(categorySlug: string, topicSlug: string) {
  return `${categorySlug}-${topicSlug}`;
}
