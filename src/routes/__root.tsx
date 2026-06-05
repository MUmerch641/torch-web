import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "@/lib/language";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Try again
          </button>
          <a href="/" className="rounded-md border border-input px-4 py-2 text-sm font-medium">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "TechTorch — The Future of Tech in Your Hands" },
      { name: "description", content: "High-end tech blog covering iPhone, Samsung Galaxy, and Google Pixel. Reviews, comparisons, and the latest news." },
      { name: "author", content: "TechTorch" },
      { property: "og:title", content: "TechTorch — The Future of Tech in Your Hands" },
      { property: "og:description", content: "High-end tech blog covering iPhone, Samsung Galaxy, and Google Pixel. Reviews, comparisons, and the latest news." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "TechTorch — The Future of Tech in Your Hands" },
      { name: "twitter:description", content: "High-end tech blog covering iPhone, Samsung Galaxy, and Google Pixel. Reviews, comparisons, and the latest news." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/dd86499e-061a-49cf-b9ec-4f7ad25cdf02/id-preview-abf61727--e2e229e0-a6cc-468d-a6bd-e0e603c3526c.lovable.app-1778594176041.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/dd86499e-061a-49cf-b9ec-4f7ad25cdf02/id-preview-abf61727--e2e229e0-a6cc-468d-a6bd-e0e603c3526c.lovable.app-1778594176041.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  // Automatic Google Translate Hook for All Blogs and Paragraphs
  useEffect(() => {
    const currentLang = localStorage.getItem("appLang") || "en";
    if (currentLang === "en") return;

    const addGoogleTranslate = () => {
      if (document.getElementById("google-translate-script")) {
        runTranslation();
        return;
      }

      // Google Translate Element
      const el = document.createElement("div");
      el.id = "google_translate_element";
      el.style.display = "none"; // Background mein rahega, dikhega nahi
      document.body.appendChild(el);

      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      document.body.appendChild(script);

      (window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement(
          { pageLanguage: "en", includedLanguages: "ru,es", layout: 0 },
          "google_translate_element"
        );
        setTimeout(runTranslation, 1000);
      };
    };

    const runTranslation = () => {
      const selectEl = document.querySelector(".goog-te-combo") as HTMLSelectElement;
      if (selectEl) {
        selectEl.value = currentLang;
        selectEl.dispatchEvent(new Event("change"));
      } else {
        setTimeout(runTranslation, 500);
      }
    };

    addGoogleTranslate();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <Outlet />
        <Toaster />
      </LanguageProvider>
    </QueryClientProvider>
  );
}