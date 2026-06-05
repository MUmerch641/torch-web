import { Link } from "@tanstack/react-router";
import { Apple, Smartphone, Sparkles, ArrowRight } from "lucide-react";
import { BRANDS } from "@/lib/site";

const ICONS = {
  iphone: Apple,
  samsung: Smartphone,
  "google-pixel": Sparkles,
} as const;

const META: Record<string, { blurb: string; image: string; stats: { label: string; value: string }[] }> = {
  iphone: {
    blurb: "iOS reviews, Apple silicon deep-dives, and rumors from Cupertino.",
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200&q=80",
    stats: [
      { label: "Reviews", value: "40+" },
      { label: "Avg. score", value: "9.1" },
    ],
  },
  samsung: {
    blurb: "Galaxy S, Z Fold/Flip, and One UI breakdowns straight from Suwon.",
    image: "https://images.unsplash.com/photo-1610792516775-01de03eae630?w=1200&q=80",
    stats: [
      { label: "Reviews", value: "35+" },
      { label: "Avg. score", value: "8.9" },
    ],
  },
  "google-pixel": {
    blurb: "Tensor performance, computational photography, and pure Android.",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=1200&q=80",
    stats: [
      { label: "Reviews", value: "22+" },
      { label: "Avg. score", value: "8.7" },
    ],
  },
};

export function CategoryCards() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-foreground/80">
          Browse by brand
        </span>
        <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Pick your flavor</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          Hand-picked coverage across the three biggest smartphone ecosystems — reviews, comparisons, and rumors.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {BRANDS.map((b) => {
          const Icon = ICONS[b.slug];
          const meta = META[b.slug];
          return (
            /* Changed from div to Link to make the entire card fully clickable */
            <Link
              key={b.slug}
              to={b.route}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow cursor-pointer"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={meta.image}
                  alt={b.label}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                <div className="absolute left-4 top-4 grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary shadow-glow">
                  <Icon className="h-5 w-5 text-primary-foreground" />
                </div>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-2xl font-bold">{b.label}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{meta.blurb}</p>
                <div className="mt-4 flex items-center gap-4 border-t border-border pt-4">
                  {meta.stats.map((s) => (
                    <div key={s.label}>
                      <div className="text-lg font-bold text-foreground">{s.value}</div>
                      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{s.label}</div>
                    </div>
                  ))}
                </div>
                {/* Changed from Link to a stylized span button to prevent HTML nesting errors */}
                <span
                  className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform group-hover:translate-x-0.5"
                >
                  View All <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}