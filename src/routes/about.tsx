import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Flame, Zap, Eye } from "lucide-react";
import { SITE_NAME } from "@/lib/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About TechTorch — Our Story" },
      { name: "description", content: "TechTorch is a high-end tech blog covering iPhone, Samsung Galaxy, and Google Pixel — written by people who actually use the phones." },
      { property: "og:title", content: "About TechTorch" },
      { property: "og:description", content: "A high-end tech blog covering iPhone, Samsung Galaxy, and Google Pixel." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="bg-hero">
          <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
            <h1 className="text-balance text-5xl font-bold tracking-tight sm:text-6xl">About {SITE_NAME}</h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
              We're a small team of phone nerds who got tired of recycled press releases. TechTorch is reviews, comparisons, and rumors — written by people who actually carry the phones every day.
            </p>
          </div>
        </section>
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { Icon: Flame, title: "Independent", body: "No publisher quotas, no review embargo theatre. We say what we think." },
              { Icon: Zap, title: "Fast", body: "From keynote to verdict in 48 hours, with deeper analysis the week after." },
              { Icon: Eye, title: "Honest", body: "If a phone's cameras are bad, we say so — even if the maker advertises with us." },
            ].map(({ Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-6">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15">
                  <Icon className="h-5 w-5 text-primary" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
