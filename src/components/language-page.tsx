import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BlogCard } from "@/components/blog-card";
import { supabase } from "@/integrations/supabase/client";
import { type BrandSlug } from "@/lib/site";
import { t, localizedBlog, type Lang } from "@/lib/i18n";
import { useLanguage } from "@/lib/language";

const HEADINGS: Record<Lang, { title: string; sub: string }> = {
  en: { title: "All blogs in English", sub: "Every TechTorch story, in English." },
  ru: { title: "Все статьи на русском", sub: "Каждая статья TechTorch на русском языке." },
  es: { title: "Todos los blogs en español", sub: "Cada historia de TechTorch, en español." },
};

export function LanguagePage({ lang: pageLang }: { lang: Lang }) {
  const { lang, setLang } = useLanguage();

  // Sync the global language to the page's language so the rest of the site follows.
  useEffect(() => {
    if (lang !== pageLang) setLang(pageLang);
  }, [pageLang, lang, setLang]);

  const heading = HEADINGS[pageLang];

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["all-blogs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const localized = posts.map((p) => {
    const l = localizedBlog(p, pageLang);
    return {
      id: p.id,
      slug: p.slug,
      title: l.title,
      excerpt: l.excerpt,
      brand: p.brand as BrandSlug,
      cover_image_url: p.cover_image_url,
      created_at: p.created_at,
    };
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="bg-hero">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              {t(pageLang, "readingLanguage")}: {pageLang.toUpperCase()} • {posts.length} {t(pageLang, "posts")}
            </span>
            <h1 className="mt-4 text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {heading.title}
            </h1>
            <p className="mt-4 max-w-xl text-muted-foreground">{heading.sub}</p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[16/10] animate-pulse rounded-2xl bg-card" />
                ))
              : localized.map((p) => <BlogCard key={p.id} post={p} />)}
          </div>
          {!isLoading && localized.length === 0 && (
            <p className="text-muted-foreground">{t(pageLang, "noPosts")}</p>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
