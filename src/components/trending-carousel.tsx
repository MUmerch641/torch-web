import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router"; // 👈 Added router Link import
import { TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { brandLabel, type BrandSlug } from "@/lib/site";

type TrendingItem = {
  rank: number;
  phones: { id: string; model: string; brand: BrandSlug } | null;
};

export function TrendingCarousel() {
  const { data: items = [] } = useQuery({
    queryKey: ["trending"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trending")
        .select("rank, phones(id, model, brand)")
        .order("rank", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as TrendingItem[];
    },
  });

  if (!items.length) return null;
  return (
    <aside className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15">
          <TrendingUp className="h-4 w-4 text-primary" />
        </span>
        <div>
          <h3 className="font-semibold">Trending Now</h3>
          <p className="text-xs text-muted-foreground">Most searched this week</p>
        </div>
      </div>
      <div className="space-y-2 flex flex-col">
        {items.map((it, i) => it.phones && (
          /* 👇 CHANGED: Converted li to Link component to make the whole row fully clickable */
          <Link 
            key={it.phones.id} 
            to={`/${it.phones.brand}`} // 👈 Routes dynamically to /iphone, /samsung, or /google-pixel
            className="group flex items-center gap-3 rounded-lg p-2 transition-all hover:bg-secondary cursor-pointer"
          >
            <span className="grid h-7 w-7 place-items-center rounded-md bg-secondary text-xs font-bold text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-colors">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              {/* Added group-hover text color switch */}
              <div className="truncate text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                {it.phones.model}
              </div>
              <div className="text-xs text-muted-foreground">
                {brandLabel(it.phones.brand)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}