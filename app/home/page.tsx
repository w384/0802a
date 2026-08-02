"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";

const categories = ["全部", "模型", "智能体", "开源", "研究", "政策"] as const;
type Category = (typeof categories)[number];
type PageState = "ready" | "loading" | "empty" | "error";

type NewsItem = {
  id: number;
  time: string;
  source: string;
  featured?: boolean;
  title?: string;
  summary: string;
  category: Exclude<Category, "全部">;
  tags: string[];
  image?: { src: string; alt: string };
};

const newsItems: NewsItem[] = [
  {
    id: 1,
    time: "10:42",
    source: "机器之心",
    featured: true,
    title: "OpenAI 发布 GPT-5：更强推理与更低幻觉，Pro 版同步上线",
    summary:
      "OpenAI 正式推出 GPT-5 系列模型，包含 GPT-5、GPT-5 mini 与 GPT-5 nano。官方称其在复杂推理、多模态理解与长上下文表现上全面领先 GPT-4o，在代码、数学与科学基准评测中取得显著提升，同时事实性错误率降低约 45%。GPT-5 引入自适应推理策略，能在不同任务需求下动态分配计算资源。",
    category: "模型",
    tags: ["模型", "OpenAI", "GPT-5", "多模态", "推理"],
  },
  {
    id: 2,
    time: "09:33",
    source: "量子位",
    title: "智谱发布 AutoGLM 2.0：支持手机端运行的通用智能体平台",
    summary:
      "智谱 AI 发布 AutoGLM 2.0，新版本在任务规划、工具调用与记忆能力上全面升级，并支持在手机端本地运行。AutoGLM 2.0 内置浏览器操作、文档处理、数据分析等常用工具，支持通过自然语言完成复杂任务编排。",
    category: "智能体",
    tags: ["智能体", "智谱", "AutoGLM", "工具调用", "应用市场"],
    image: {
      src: "/images/agent-dashboard.png",
      alt: "AutoGLM 智能体桌面控制台界面",
    },
  },
  {
    id: 3,
    time: "08:15",
    source: "AI 科技评论",
    title: "Meta 开源 Llama 3.1 405B：原生 256K 上下文，商用许可更宽松",
    summary:
      "Meta 发布 Llama 3.1 405B 开源模型，支持原生 256K 上下文窗口，在代码生成、长文档理解与多语言能力上取得明显提升。新模型采用改进的分组查询注意力与 RoPE 扩展，训练数据规模与质量同步升级。",
    category: "开源",
    tags: ["开源", "Meta", "Llama 3.1", "大模型", "长上下文"],
    image: {
      src: "/images/open-model-keynote.png",
      alt: "开源大模型技术发布会现场",
    },
  },
  {
    id: 4,
    time: "07:02",
    source: "DeepTech 深科技",
    featured: true,
    summary:
      "一项来自上海交通大学与腾讯的联合研究提出了分层强化学习框架 HRL-GPT，用于提升智能体在开放环境中的长期规划与泛化能力。研究团队在 WebShop 和 Mind2Web 等基准上验证了该方法的有效性，相比现有基线显著提升任务成功率与步骤效率。论文指出，当前通用智能体的瓶颈主要在于目标分解的稳定性与环境建模的泛化能力。",
    category: "研究",
    tags: ["研究", "强化学习", "智能体", "目标分解", "泛化能力"],
  },
  {
    id: 5,
    time: "05:48",
    source: "财新网",
    title: "国家网信办就《生成式人工智能服务管理暂行办法（征求意见稿）》公开征求意见",
    summary:
      "为促进生成式人工智能健康发展和规范应用，国家网信办起草了相关管理办法，面向社会公开征求意见。意见稿围绕服务提供者义务、内容安全、数据保护、算法透明等方面提出具体要求。",
    category: "政策",
    tags: ["政策", "监管", "生成式 AI", "数据安全", "征求意见"],
  },
];

function SkeletonFeed() {
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

function NewsFeedPage() {
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<Category>("全部");
  const [pageState, setPageState] = useState<PageState>("ready");
  const [signedIn, setSignedIn] = useState(false);
  const [ignoreRequestedState, setIgnoreRequestedState] = useState(false);
  const requestedState = searchParams.get("state");
  const effectivePageState =
    !ignoreRequestedState &&
    pageState === "ready" &&
    (requestedState === "empty" || requestedState === "error")
      ? requestedState
      : pageState;

  const visibleItems = useMemo(
    () =>
      activeCategory === "全部"
        ? newsItems
        : newsItems.filter((item) => item.category === activeCategory),
    [activeCategory],
  );

  const selectCategory = (category: Category) => {
    setIgnoreRequestedState(true);
    setActiveCategory(category);
    setPageState("loading");
    const nextItems =
      category === "全部" ? newsItems : newsItems.filter((item) => item.category === category);
    window.setTimeout(() => {
      setPageState(nextItems.length > 0 ? "ready" : "empty");
    }, 320);
  };

  const retryFeed = () => {
    setIgnoreRequestedState(true);
    setPageState("loading");
    window.setTimeout(() => setPageState("ready"), 320);
  };

  return (
    <div className="site-shell">
      <header className="site-header">
        <nav className="nav-shell" aria-label="主导航">
          <a className="brand" href="/home" aria-label="AI NEWS 首页">
            <Image src="/images/ai-news-mark.png" width={30} height={30} alt="" priority />
            <span>AI NEWS</span>
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
        <h1>今天 · 8月2日</h1>

        {effectivePageState === "loading" ? <SkeletonFeed /> : null}

        {effectivePageState === "empty" ? (
          <section className="feedback-state" aria-live="polite">
            <h2>当前分类暂无资讯</h2>
            <p>可以返回全部资讯，或稍后刷新查看。</p>
            <button type="button" onClick={() => selectCategory("全部")}>
              返回全部
            </button>
          </section>
        ) : null}

        {effectivePageState === "error" ? (
          <section className="feedback-state" role="alert">
            <h2>资讯加载失败</h2>
            <p>网络暂时不可用，请重新尝试。</p>
            <button type="button" onClick={retryFeed}>
              重试
            </button>
          </section>
        ) : null}

        {effectivePageState === "ready" ? (
          <ol className="news-list" aria-label={`${activeCategory}资讯`}>
            {visibleItems.map((item, index) => (
              <li className="news-row" key={item.id}>
                <time className="news-time" dateTime={`2026-08-02T${item.time}:00+08:00`}>
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

export default function HomePage() {
  return (
    <Suspense fallback={<div className="page-loading"><SkeletonFeed /></div>}>
      <NewsFeedPage />
    </Suspense>
  );
}
