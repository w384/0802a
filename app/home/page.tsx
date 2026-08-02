import { Suspense } from "react";
import { getNewsItems } from "@/lib/news";
import { NewsFeedClient, SkeletonFeed } from "./news-feed-client";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { items, error } = await getNewsItems();

  return (
    <Suspense fallback={<div className="page-loading"><SkeletonFeed /></div>}>
      <NewsFeedClient initialItems={items} initialError={error} />
    </Suspense>
  );
}
