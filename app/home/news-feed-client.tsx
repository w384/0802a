"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { categories, type Category, type NewsItem, type PageState } from "@/lib/news-types";

type NewsFeedClientProps = {
  initialItems: NewsItem[];
  initialError?: string;
};

function formatDateHeading(items: NewsItem[]) {
  const firstPublishedAt = items[0]?.publishedAt;

  if (!firstPublishedAt) {
    return "今天 · 8月2日";
  }

  const publishedDate = new Date(firstPublishedAt);
  const month = publishedDate.toLocaleDateString("zh-CN", {
    month: "numeric",
    timeZone: "Asia/Shanghai",
  });
  const day = publishedDate.toLocaleDateString("zh-CN", {
    day: "numeric",
    timeZone: "Asia/Shanghai",
  });

  return `今天 · ${month}${day}`;
}

export function SkeletonFeed() {
  return (
    <div className="state-list" aria-label="资讯加载中" aria-busy="true">
      {[0, 1, 2].map((item) => (
        <div className="skeleton-row" key={item}>
          <span className="skeleton-time" />
          <div className="skeleton-content">
            <span className="skeleton-line skeleton-line-short" />
            <span className="skeleton-line skeleton-line-title" />
            <span className="skeleton-line" />
            <span className="skeleton-line skeleton-line-wide" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function NewsFeedClient({ initialItems, initialError }: NewsFeedClientProps) {
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<Category>("全部");
  const [pageState, setPageState] = useState<PageState>("ready");
  const [signedIn, setSignedIn] = useState(false);
  const [ignoreRequestedState, setIgnoreRequestedState] = useState(false);
  const requestedState = searchParams.get("state");

  const visibleItems = useMemo(
    () =>
      activeCategory === "全部"
        ? initialItems
        : initialItems.filter((item) => item.category === activeCategory),
    [activeCategory, initialItems],
  );

  const requestedOverride =
    !ignoreRequestedState &&
    !initialError &&
    pageState === "ready" &&
    (requestedState === "empty" || requestedState === "error")
      ? requestedState
      : null;
  const contentState =
    requestedOverride ?? (initialError ? "error" : visibleItems.length === 0 ? "empty" : pageState);

  const selectCategory = (category: Category) => {
    setIgnoreRequestedState(true);
    setActiveCategory(category);
    setPageState("loading");
    const nextItems =
      category === "全部" ? initialItems : initialItems.filter((item) => item.category === category);
    window.setTimeout(() => {
      setPageState(nextItems.length > 0 ? "ready" : "empty");
    }, 320);
  };

  const retryFeed = () => {
    setIgnoreRequestedState(true);
    setPageState("loading");
    window.location.reload();
  };

  return (
    <div className="site-shell">
      <header className="site-header">
        <nav className="nav-shell" aria-label="主导航">
          <a className="brand" href="/home" aria-label="AI NEWS｜你的情报收集助理 首页">
            <Image src="/images/ai-news-mark.png" width={30} height={30} alt="" priority />
            <span>AI NEWS｜你的情报收集助理</span>
          </a>

          <div className="category-tabs" aria-label="资讯分类">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={activeCategory === category ? "category-tab active" : "category-tab"}
                aria-pressed={activeCategory === category}
                onClick={() => selectCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <button
            className="login-button"
            type="button"
            aria-pressed={signedIn}
            onClick={() => setSignedIn((current) => !current)}
          >
            {signedIn ? "已登录" : "登录"}
          </button>
        </nav>
      </header>

      <main className="feed-shell">
        <h1>{formatDateHeading(initialItems)}</h1>

        {contentState === "loading" ? <SkeletonFeed /> : null}

        {contentState === "empty" ? (
          <section className="feedback-state" aria-live="polite">
            <h2>当前分类暂无资讯</h2>
            <p>可以返回全部资讯，或稍后刷新查看。</p>
            <button type="button" onClick={() => selectCategory("全部")}>
              返回全部
            </button>
          </section>
        ) : null}

        {contentState === "error" ? (
          <section className="feedback-state" role="alert">
            <h2>资讯加载失败</h2>
            <p>{initialError ?? "网络暂时不可用，请重新尝试。"}</p>
            <button type="button" onClick={retryFeed}>
              重试
            </button>
          </section>
        ) : null}

        {contentState === "ready" ? (
          <ol className="news-list" aria-label={`${activeCategory}资讯`}>
            {visibleItems.map((item, index) => (
              <li className="news-row" key={item.id}>
                <time className="news-time" dateTime={item.publishedAt}>
                  {item.time}
                </time>
                <span className="timeline-dot" aria-hidden="true" />
                {index < visibleItems.length - 1 ? (
                  <span className="timeline-line" aria-hidden="true" />
                ) : null}

                <article className="news-article">
                  <div className="source-line">
                    <span>{item.source}</span>
                    {item.featured ? <span className="featured-badge">精选</span> : null}
                  </div>
                  {item.title ? <h2>{item.title}</h2> : <h2 className="summary-label">原文摘要</h2>}
                  <p className="summary">{item.summary}</p>
                  {item.image ? (
                    <div className="news-media">
                      <Image
                        src={item.image.src}
                        alt={item.image.alt}
                        width={800}
                        height={450}
                        sizes="400px"
                        loading="eager"
                      />
                    </div>
                  ) : null}
                  <ul className="tag-list" aria-label="话题标签">
                    {item.tags.slice(0, 3).map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                </article>
              </li>
            ))}
          </ol>
        ) : null}
      </main>
    </div>
  );
}
