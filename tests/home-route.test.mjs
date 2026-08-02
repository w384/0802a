import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const projectFile = (path) => new URL(`../${path}`, import.meta.url);

test("the root route redirects visitors to /home", async () => {
  const source = await readFile(projectFile("app/page.tsx"), "utf8");

  assert.match(source, /redirect\(["']\/home["']\)/);
});

test("the /home route exposes the required news categories and UI states", async () => {
  const source = await readFile(projectFile("app/home/page.tsx"), "utf8").catch(
    () => "",
  );

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

test("simulated empty and error states can recover to the news feed", async () => {
  const source = await readFile(projectFile("app/home/page.tsx"), "utf8");

  assert.match(source, /setIgnoreRequestedState\(true\)/);
  assert.match(source, /setPageState\("loading"\)/);
});

test("above-the-fold news media is loaded eagerly", async () => {
  const source = await readFile(projectFile("app/home/page.tsx"), "utf8");

  assert.match(source, /loading="eager"/);
});

test("each news item renders no more than three tags", async () => {
  const source = await readFile(projectFile("app/home/page.tsx"), "utf8");

  assert.match(source, /item\.tags\.slice\(0, 3\)\.map/);
});

test("the technology-blue header and readable background artwork are applied", async () => {
  const styles = await readFile(projectFile("app/globals.css"), "utf8");

  assert.match(styles, /--technology-blue:/);
  assert.match(styles, /technology-background\.png/);
  assert.match(styles, /\.source-line[^}]*font-weight:\s*650/s);
});
