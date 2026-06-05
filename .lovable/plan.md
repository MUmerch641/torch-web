import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { CategoryCards } from "@/components/category-cards";
import { CompareTool } from "@/components/compare-tool";
import { BlogCard } from "@/components/blog-card";
import { supabase } from "@/integrations/supabase/client";
import { localizedBlog } from "@/lib/i18n";
import { useLanguage } from "@/lib/language";
import { type BrandSlug } from "@/lib/site";
import { Flame, TrendingUp, Mail } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function Index() {
  const { lang } = useLanguage();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 1. Fetch Latest Blogs Data
  const { data: latestPosts = [], isLoading: blogsLoading } = useQuery({
    queryKey: ["latest-blogs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  // 2. Fetch Trending Phones Data for Carousel (With linked phones relationship)
  const { data: trendingItems = [], isLoading: trendingLoading } = useQuery({
    queryKey: ["trending-phones"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trending")
        .select(`
          id,
          rank,
          phones (
            id,
            brand,
            model,
            price,
            image_url
          )
        `)
        .order("rank", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Newsletter Subscription Logic
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert([{ email: email.trim() }]);
      
      if (error) {
        if (error.code === "23505") toast.error("You are already subscribed!");
        else throw error;
      } else {
        toast.success("Welcome to TechTorch! Check your inbox soon.");
        setEmail("");
      }
    } catch (err) {
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const localizedBlogs = latestPosts.map((p) => {
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
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* 1. Sticky Header */}
      <Header />

      <main>
        {/* 2. Hero Section */}
        <Hero />

        {/* 3. Browse By Brand (Category Cards) */}
        <CategoryCards />

        {/* 4. Trending Now Section (Fully Clickable Card Logic) */}
        <section className="border-t border-border/40 bg-secondary/15 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center gap-2">
              <span className="flex h-8 w-8 place-items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                <Flame className="h-5 w-5 fill-orange-500/20" />
              </span>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Trending Now</h2>
                <p className="text-xs text-muted-foreground">Most searched ecosystems and setups this week</p>
              </div>
            </div>

            {trendingLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-40 animate-pulse rounded-2xl bg-card border border-border" />
                ))}
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                {trendingItems.map((item: any) => {
                  const phone = item.phones;
                  if (!phone) return null;

                  // Map brand slugs directly to targeted routes
                  const routeSlug = 
                    phone.brand === "iphone" ? "iphone" : 
                    phone.brand === "samsung" ? "samsung" : 
                    "google-pixel";

                  return (
                    /* FIXED: Converted the wrapper into an active <Link> for full clickable behavior */
                    <Link
                      key={item.id}
                      to={`/${routeSlug}`}
                      className="group relative flex min-w-[280px] flex-1 flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow cursor-pointer"
                    >
                      {/* Top Rank Badge */}
                      <div className="absolute right-3 top-3 flex h-6 w-6 place-items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary z-10">
                        #{item.rank}
                      </div>

                      <div className="flex gap-4 items-start">
                        {/* Render Phone Thumbnail if available */}
                        {phone.image_url && (
                          <div className="h-16 w-16 rounded-xl overflow-hidden bg-muted border border-border shrink-0">
                            <img 
                              src={phone.image_url} 
                              alt={phone.model} 
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" 
                            />
                          </div>
                        )}
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                            {phone.brand === "google-pixel" ? "Google Pixel" : phone.brand === "iphone" ? "Apple" : "Samsung"}
                          </span>
                          <h4 className="mt-0.5 text-base font-bold tracking-tight group-hover:text-primary transition-colors line-clamp-2">
                            {phone.model}
                          </h4>
                        </div>
                      </div>

                      {/* Footer Info inside Card */}
                      <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3">
                        <span className="text-sm font-semibold text-foreground/80">{phone.price || "—"}</span>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          View Blogs <TrendingUp className="h-3 w-3" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* 5. Latest Reviews & Blogs Section */}
        <section id="latest" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">Latest Stories</h2>
              <p className="mt-2 text-sm text-muted-foreground">Fresh analysis on the devices you care about.</p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogsLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[16/11] animate-pulse rounded-2xl bg-card border border-border" />
                ))
              : localizedBlogs.map((p) => <BlogCard key={p.id} post={p} />)}
          </div>
          
          {!blogsLoading && localizedBlogs.length === 0 && (
            <p className="text-center text-muted-foreground py-12">No posts available right now.</p>
          )}
        </section>

        {/* 6. Dynamic Tech Specs Comparison Section */}
        <CompareTool />

        {/* 7. Newsletter Section */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card to-secondary/30 p-8 sm:p-12 lg:p-16">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative mx-auto max-w-2xl text-center">
              <Mail className="mx-auto h-8 w-8 text-primary" />
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Stay in the Loop</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Don't miss a beat. Get tech updates in your inbox.
              </p>
              <form onSubmit={handleSubscribe} className="mt-8 flex flex-col gap-3 sm:flex-row justify-center max-w-md mx-auto">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-base font-medium placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50 shrink-0"
                >
                  {submitting ? "Subscribing..." : "Subscribe"}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* 8. Footer Section */}
      <Footer />
    </div>
  );
}