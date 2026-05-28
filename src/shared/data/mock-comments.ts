export type MockComment = {
  id: string;
  postId: string;
  authorName: string;
  createdAt: string;
  body: string;
};

export const mockComments: MockComment[] = [
  {
    id: "comment-1",
    postId: "motorcycle-showcase-post-1",
    authorName: "ChainLab",
    createdAt: "2026.05.28",
    body: "세팅이 깔끔하네요. 같은 차종이라 튜닝 부품 리스트도 궁금합니다.",
  },
  {
    id: "comment-2",
    postId: "motorcycle-showcase-post-1",
    authorName: "OilNote",
    createdAt: "2026.05.28",
    body: "사진 각도랑 정비 기록이 같이 있으니까 참고하기 좋습니다.",
  },
  {
    id: "comment-3",
    postId: "motorcycle-maintenance-post-1",
    authorName: "Garage9",
    createdAt: "2026.05.27",
    body: "교체 주기 기록해두면 다음 관리할 때 확실히 편하더라고요.",
  },
];

export function getMockCommentsByPostId(postId: string) {
  return mockComments.filter((comment) => comment.postId === postId);
}
