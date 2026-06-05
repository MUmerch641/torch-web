import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BlogCard } from "@/components/blog-card";
import { supabase } from "@/integrations/supabase/client";
import { brandLabel, type BrandSlug } from "@/lib/site";
import { t, localizedBlog } from "@/lib/i18n";
import { useLanguage } from "@/lib/language";

const HEADLINES: Record<BrandSlug, { title: string; sub: string }> = {
  iphone: { title: "All things iPhone", sub: "Reviews, rumors, and Apple silicon deep-dives." },
  samsung: { title: "Galaxy unfolded", sub: "From Galaxy S to Z Fold/Flip — every Samsung update." },
  "google-pixel": { title: "Pure Pixel", sub: "Tensor performance, Magic Editor, and pure Android." },
};

export function BrandPage({ brand }: { brand: BrandSlug }) {
  const { lang } = useLanguage();
  const headline = HEADLINES[brand];

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["blogs-brand", brand],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("brand", brand)
        .eq("published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const localized = posts.map((p) => {
    const l = localizedBlog(p, lang);
    return {
      id: p.id,
      slug: p.slug,
      title: l.title,
      excerpt: l.excerpt,
      brand: p.brand as BrandSlug,
      cover_image_url: p.cover_image_url,
      created_at: p.created_at,
      translated: l.translated,
    };
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="bg-hero">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              {brandLabel(brand)} • {posts.length} {t(lang, "posts")}
            </span>
            <h1 className="mt-4 text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {headline.title}
            </h1>
            <p className="mt-4 max-w-xl text-muted-foreground">{headline.sub}</p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 text-sm font-medium text-muted-foreground">{t(lang, "readingLanguage")}: {lang.toUpperCase()}</div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[16/10] animate-pulse rounded-2xl bg-card" />
                ))
              : localized.map((p) => <BlogCard key={p.id} post={p} />)}
          </div>
          {!isLoading && localized.length === 0 && (
            <p className="text-muted-foreground">{t(lang, "noPosts")}</p>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
