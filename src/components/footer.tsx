import { Link } from "@tanstack/react-router";
import { Youtube, Twitter, Github } from "lucide-react";
import { BRANDS, SITE_NAME, YOUTUBE_URL } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold">
            <span className="relative grid h-9 w-9 place-items-center rounded-full border border-border bg-card font-black text-primary shadow-sm">
              T
              <span className="absolute -bottom-0.5 h-1 w-5 rounded-full bg-primary" />
            </span>
            {SITE_NAME}
          </Link>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            TechTorch is a high-end tech blog covering the world's most exciting smartphones — iPhone, Samsung Galaxy, and Google Pixel. Reviews, comparisons, and the latest news.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground">
              <Youtube className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Twitter" className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="#" aria-label="GitHub" className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground">
              <Github className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">Brands</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {BRANDS.map((b) => (
              <li key={b.slug}>
                <Link to={b.route} className="hover:text-foreground">{b.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">Company</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-foreground">About Us</Link></li>
            <li><a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">YouTube Channel</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
      </div>
    </footer>
  );
}
