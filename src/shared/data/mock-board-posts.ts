import { equipmentCategories } from "./equipment-categories";

export type MockBoardPost = {
  id: string;
  boardSlug: string;
  title: string;
  excerpt: string;
  authorName: string;
  createdAt: string;
  commentCount: number;
  likeCount: number;
  hasImage?: boolean;
};

export const mockBoardPosts: MockBoardPost[] = equipmentCategories.flatMap((category) =>
  category.boards.flatMap((board, boardIndex) => [
    {
      id: `${board.slug}-post-1`,
      boardSlug: board.slug,
      title: `${category.label} ${board.title} 첫 번째 기록`,
      excerpt: `${category.label} 카테고리에서 ${board.description}에 대해 공유하는 예시 게시글입니다.`,
      authorName: boardIndex % 2 === 0 ? "garage_maker" : "gear_reviewer",
      createdAt: "2026-05-28",
      commentCount: 4 + boardIndex,
      likeCount: 12 + boardIndex * 3,
      hasImage: board.type === "showcase" || board.type === "review",
    },
    {
      id: `${board.slug}-post-2`,
      boardSlug: board.slug,
      title: `${board.title} 체크리스트 공유`,
      excerpt: "실제 게시판 연결 전 화면 구성을 확인하기 위한 mock 게시글입니다.",
      authorName: "gearduck_user",
      createdAt: "2026-05-27",
      commentCount: 2,
      likeCount: 8,
      hasImage: board.type === "showcase",
    },
  ]),
);

export function getMockPostsByBoardSlug(boardSlug: string) {
  return mockBoardPosts.filter((post) => post.boardSlug === boardSlug);
}
