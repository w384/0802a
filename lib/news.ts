import { categories, type NewsCategory, type NewsItem } from "./news-types";

type SupabaseNewsItem = {
  id: number;
  published_at: string | null;
  source_name: string | null;
  is_featured: boolean | null;
  title: string | null;
  summary: string | null;
  category: string | null;
  tags: string[] | null;
  image_src: string | null;
  image_alt: string | null;
};

type NewsResult = {
  items: NewsItem[];
  error?: string;
};

const newsCategories = categories.filter((category) => category !== "全部") as NewsCategory[];

const timeFormatter = new Intl.DateTimeFormat("zh-CN", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Shanghai",
});

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return {
      error: "请在 .env.local 配置 SUPABASE_URL 和 SUPABASE_PUBLISHABLE_KEY 后重启开发服务器。",
    };
  }

  return { url, key };
}

function getSupabaseHeaders(key: string) {
  const headers: Record<string, string> = {
    Accept: "application/json",
    apikey: key,
  };

  if (!key.startsWith("sb_publishable_")) {
    headers.Authorization = `Bearer ${key}`;
  }

  return headers;
}

function normalizeCategory(category: string | null): NewsCategory | null {
  if (!category) {
    return null;
  }

  return newsCategories.includes(category as NewsCategory) ? (category as NewsCategory) : null;
}

function formatPublishedTime(publishedAt: string | null) {
  if (!publishedAt) {
    return "--:--";
  }

  return timeFormatter.format(new Date(publishedAt));
}

function normalizeNewsItem(row: SupabaseNewsItem): NewsItem | null {
  const category = normalizeCategory(row.category);

  if (!category || !row.summary || !row.source_name || !row.published_at) {
    return null;
  }

  return {
    id: row.id,
    publishedAt: row.published_at,
    time: formatPublishedTime(row.published_at),
    source: row.source_name,
    featured: Boolean(row.is_featured),
    title: row.title ?? undefined,
    summary: row.summary,
    category,
    tags: Array.isArray(row.tags) ? row.tags : [],
    image:
      row.image_src && row.image_alt
        ? {
            src: row.image_src,
            alt: row.image_alt,
          }
        : undefined,
  };
}

export async function getNewsItems(): Promise<NewsResult> {
  const config = getSupabaseConfig();

  if ("error" in config) {
    return { items: [], error: config.error };
  }

  const endpoint = new URL("/rest/v1/news_items", config.url);
  endpoint.searchParams.set(
    "select",
    "id,published_at,source_name,is_featured,title,summary,category,tags,image_src,image_alt",
  );
  endpoint.searchParams.set("order", "published_at.desc.nullslast");

  try {
    const response = await fetch(endpoint, {
      cache: "no-store",
      headers: getSupabaseHeaders(config.key),
    });

    if (!response.ok) {
      return {
        items: [],
        error: `Supabase news_items 读取失败：${response.status} ${response.statusText}`,
      };
    }

    const rows = (await response.json()) as SupabaseNewsItem[];
    return { items: rows.map(normalizeNewsItem).filter((item): item is NewsItem => item !== null) };
  } catch {
    return { items: [], error: "Supabase news_items 读取失败，请检查网络和环境变量配置。" };
  }
}
