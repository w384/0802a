import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const projectFile = (path) => new URL(`../${path}`, import.meta.url);

async function readHomeSources() {
  const sources = await Promise.all([
    readFile(projectFile("app/home/page.tsx"), "utf8"),
    readFile(projectFile("app/home/news-feed-client.tsx"), "utf8"),
    readFile(projectFile("lib/news-types.ts"), "utf8"),
  ]);

  return sources.join("\n");
}

test("the root route redirects visitors to /home", async () => {
  const source = await readFile(projectFile("app/page.tsx"), "utf8");

  assert.match(source, /redirect\(["']\/home["']\)/);
});

test("the /home route exposes the required news categories and UI states", async () => {
  const source = await readHomeSources();

  for (const label of [
    "全部",
    "模型",
    "智能体",
    "开源",
    "研究",
    "政策",
    "loading",
    "empty",
    "error",
  ]) {
    assert.match(source, new RegExp(label));
  }
});

test("the /home brand includes the intelligence assistant descriptor", async () => {
  const source = await readHomeSources();

  assert.match(source, /AI NEWS｜你的情报收集助理/);
});

test("the /home route reads news items from Supabase instead of inline mock data", async () => {
  const pageSource = await readFile(projectFile("app/home/page.tsx"), "utf8");
  const newsSource = await readFile(projectFile("lib/news.ts"), "utf8");

  assert.doesNotMatch(pageSource, /const newsItems:\s*NewsItem\[\]\s*=/);
  assert.match(pageSource, /getNewsItems\(\)/);
  assert.match(newsSource, /\/rest\/v1\/news_items/);
  assert.match(newsSource, /SUPABASE_PUBLISHABLE_KEY/);
  assert.doesNotMatch(newsSource, /OpenAI 发布 GPT-5/);
});

test("Supabase publishable keys are not sent as bearer JWTs", async () => {
  const newsSource = await readFile(projectFile("lib/news.ts"), "utf8");

  assert.match(newsSource, /getSupabaseHeaders/);
  assert.match(newsSource, /sb_publishable_/);
  assert.doesNotMatch(newsSource, /Authorization:\s*`Bearer \$\{config\.key\}`/);
});

test("simulated empty and error states can recover to the news feed", async () => {
  const source = await readHomeSources();

  assert.match(source, /setIgnoreRequestedState\(true\)/);
  assert.match(source, /setPageState\("loading"\)/);
});

test("above-the-fold news media is loaded eagerly", async () => {
  const source = await readHomeSources();

  assert.match(source, /loading="eager"/);
});

test("each news item renders no more than three tags", async () => {
  const source = await readHomeSources();

  assert.match(source, /item\.tags\.slice\(0, 3\)\.map/);
});

test("the technology-blue header and readable background artwork are applied", async () => {
  const styles = await readFile(projectFile("app/globals.css"), "utf8");

  assert.match(styles, /--technology-blue:/);
  assert.match(styles, /technology-background\.png/);
  assert.match(styles, /\.source-line[^}]*font-weight:\s*650/s);
});
