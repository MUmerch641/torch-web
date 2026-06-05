import { Youtube, ArrowRight } from "lucide-react";
import { SITE_TAGLINE } from "@/lib/site";
import { useState, useEffect } from "react";

// YouTube Links object mapping for different languages
const YOUTUBE_LINKS: Record<string, string> = {
  en: "https://youtube.com/@Techtorchyt",
  ru: "https://www.youtube.com/@techtorchrussian",
  es: "https://www.youtube.com/@TechTorch-Spanish",
};

export function Hero() {
  const [currentLang, setCurrentLang] = useState("en");

  // LocalStorage se safely language detect karne ke liye hook
  useEffect(() => {
    const lang = localStorage.getItem("appLang") || "en";
    setCurrentLang(lang);
  }, []);

  // Dynamically extract the correct YouTube link based on selected language
  const activeYoutubeLink = YOUTUBE_LINKS[currentLang] || YOUTUBE_LINKS.en;

  return (
    <section className="bg-hero relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            New reviews every week
          </span>
          <h1 className="mt-6 text-balance text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            {SITE_TAGLINE}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-balance text-lg text-muted-foreground">
            In-depth reviews, head-to-head comparisons, and the news that matters from iPhone, Samsung, and Google Pixel.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {/* Fully Dynamic YouTube Button linked with language state */}
            <a
              href={activeYoutubeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#FF0000] px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-105"
            >
              <Youtube className="h-5 w-5" /> Watch on YouTube
            </a>
            <a
              href="#latest"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-6 py-3 text-sm font-semibold text-foreground backdrop-blur transition-colors hover:bg-secondary"
            >
              Latest blogs <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}