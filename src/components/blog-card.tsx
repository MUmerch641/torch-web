import { Link } from "@tanstack/react-router";
import { Calendar, ArrowUpRight } from "lucide-react";
import { brandLabel, type BrandSlug } from "@/lib/site";

export type BlogCardData = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  brand: BrandSlug;
  cover_image_url: string | null;
  created_at: string;
};

export function BlogCard({ post }: { post: BlogCardData }) {
  const date = new Date(post.created_at).toLocaleDateString(undefined, {
    year: "numeric", month: "short", day: "numeric",
  });
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-secondary to-card">
        <img
          src={post.cover_image_url || `https://source.unsplash.com/800x500/?${post.brand},smartphone`}
          alt={post.title}
          loading="lazy"
          onError={(e) => {
            const target = e.currentTarget;
            const fallback = `https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&q=80`;
            if (target.src !== fallback) target.src = fallback;
          }}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-background/80 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur">
          {brandLabel(post.brand)}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-lg font-semibold leading-tight transition-colors group-hover:text-primary">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">{post.excerpt}</p>
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" /> {date}
          </span>
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </Link>
  );
}
