export const categories = ["全部", "模型", "智能体", "开源", "研究", "政策"] as const;

export type Category = (typeof categories)[number];
export type NewsCategory = Exclude<Category, "全部">;
export type PageState = "ready" | "loading" | "empty" | "error";

export type NewsItem = {
  id: number;
  publishedAt: string;
  time: string;
  source: string;
  featured?: boolean;
  title?: string;
  summary: string;
  category: NewsCategory;
  tags: string[];
  image?: { src: string; alt: string };
};
