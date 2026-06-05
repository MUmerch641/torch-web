import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Calendar, ArrowLeft } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { supabase } from "@/integrations/supabase/client";
import { brandLabel, type BrandSlug } from "@/lib/site";
import { t, localizedBlog } from "@/lib/i18n";
import { useLanguage } from "@/lib/language";

export const Route = createFileRoute("/blog/$slug")({
  component: BlogDetail,
});

function BlogDetail() {
  const { slug } = Route.useParams();
  const { lang } = useLanguage();

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (!isLoading && !post) throw notFound();

  const localized = post ? localizedBlog(post, lang) : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back home
        </Link>

        {isLoading || !post || !localized ? (
          <div className="mt-8 space-y-4">
            <div className="h-12 w-3/4 animate-pulse rounded bg-card" />
            <div className="h-64 animate-pulse rounded-2xl bg-card" />
          </div>
        ) : (
          <article className="mt-6">
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary">
                {brandLabel(post.brand as BrandSlug)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(post.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>
            <h1 className="mt-4 text-balance text-4xl font-bold leading-tight sm:text-5xl">
              {localized.title}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">{localized.excerpt}</p>

            <div className="mt-6 text-sm font-medium text-muted-foreground">{t(lang, "readingLanguage")}: {lang.toUpperCase()}</div>

            {post.cover_image_url && (
              <img src={post.cover_image_url} alt={localized.title} className="mt-8 w-full rounded-2xl" />
            )}

            <div className="prose prose-invert mt-10 max-w-none whitespace-pre-wrap text-base leading-relaxed text-foreground/90">
              {localized.body}
            </div>
          </article>
        )}
      </main>
      <Footer />
    </div>
  );
}
