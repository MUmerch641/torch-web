import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { CategoryCards } from "@/components/category-cards";
import { BlogCard, type BlogCardData } from "@/components/blog-card";
import { CompareTool } from "@/components/compare-tool";
import { TrendingCarousel } from "@/components/trending-carousel";
import { Newsletter } from "@/components/newsletter";
import { supabase } from "@/integrations/supabase/client";
import { localizedBlogSummary } from "@/lib/i18n";
import { useLanguage } from "@/lib/language";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { lang } = useLanguage();
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["latest-blogs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select("id, slug, title, excerpt, title_ru, excerpt_ru, title_es, excerpt_es, brand, cover_image_url, created_at")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  const localizedPosts: BlogCardData[] = posts.map((p) => ({
    id: p.id,
    slug: p.slug,
    ...localizedBlogSummary(p, lang),
    brand: p.brand,
    cover_image_url: p.cover_image_url,
    created_at: p.created_at,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <CategoryCards />

        <section id="latest" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Fresh off the press
              </span>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Latest Blogs</h2>
            </div>
          </div>
          <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
            <div className="grid gap-6 sm:grid-cols-2">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="aspect-[16/10] animate-pulse rounded-2xl bg-card" />
                  ))
                : localizedPosts.map((p) => <BlogCard key={p.id} post={p} />)}
              {!isLoading && posts.length === 0 && (
                <p className="col-span-full text-muted-foreground">No posts yet.</p>
              )}
            </div>
            <TrendingCarousel />
          </div>
        </section>

        <CompareTool />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
