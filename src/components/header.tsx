import { Link } from "@tanstack/react-router";
import { LogIn, LayoutDashboard, Menu, X, Youtube } from "lucide-react";
import { useState } from "react";
import { SITE_NAME } from "@/lib/site";
import { useAuth } from "@/hooks/use-auth";

const NAV_LINKS = [
  { to: "/", label: { en: "Home", ru: "Главная", es: "Inicio" } },
  { to: "/about", label: { en: "About Us", ru: "О нас", es: "Nosotros" } },
] as const;

// YouTube Links object mapping for different languages
const YOUTUBE_LINKS: Record<string, string> = {
  en: "https://youtube.com/@Techtorchyt",
  ru: "https://www.youtube.com/@techtorchrussian",
  es: "https://www.youtube.com/@TechTorch-Spanish",
};

export function Header() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(localStorage.getItem("appLang") || "en");

  const changeLanguage = (langCode: string) => {
    localStorage.setItem("appLang", langCode);
    setCurrentLang(langCode);
    
    if ((window as any).triggerGlobalTranslate) {
      (window as any).triggerGlobalTranslate(langCode);
    } else {
      window.location.reload();
    }
  };

  const getLabel = (labelObj: { en: string; ru: string; es: string }) => {
    return labelObj[currentLang as "en" | "ru" | "es"] || labelObj.en;
  };

  // Dynamically extract the correct YouTube link based on selected language
  const activeYoutubeLink = YOUTUBE_LINKS[currentLang] || YOUTUBE_LINKS.en;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-2 text-lg font-extrabold tracking-tight">
          <span className="relative grid h-9 w-9 place-items-center rounded-full border border-border bg-card font-black text-primary shadow-sm">
            T
            <span className="absolute -bottom-0.5 h-1 w-5 rounded-full bg-primary transition-transform group-hover:scale-x-125" />
          </span>
          <span>{SITE_NAME}</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-4 md:flex lg:gap-6">
          <ul className="flex items-center gap-2 lg:gap-4">
            {NAV_LINKS.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  activeProps={{ className: "rounded-md px-3 py-2 text-sm font-semibold text-foreground bg-secondary" }}
                  activeOptions={{ exact: true }}
                >
                  {getLabel(l.label)}
                </Link>
              </li>
            ))}
            {/* Dynamic YouTube Link on Desktop */}
            <li>
              <a
                href={activeYoutubeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-red-500 font-medium transition-colors hover:bg-red-500/10 hover:text-red-600"
              >
                <Youtube className="h-4 w-4" />
                {currentLang === "ru" ? "Ютуб" : currentLang === "es" ? "YouTube" : "YouTube"}
              </a>
            </li>
          </ul>

          {/* Language Selector Buttons */}
          <div className="flex items-center gap-1 border-l border-border pl-4">
            <button
              onClick={() => changeLanguage("en")}
              className={`rounded-md px-2.5 py-1 text-xs transition-all ${currentLang === "en" ? "bg-primary text-primary-foreground font-bold shadow-sm" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
            >
              English
            </button>
            <button
              onClick={() => changeLanguage("ru")}
              className={`rounded-md px-2.5 py-1 text-xs transition-all ${currentLang === "ru" ? "bg-primary text-primary-foreground font-bold shadow-sm" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
            >
              Russian
            </button>
            <button
              onClick={() => changeLanguage("es")}
              className={`rounded-md px-2.5 py-1 text-xs transition-all ${currentLang === "es" ? "bg-primary text-primary-foreground font-bold shadow-sm" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
            >
              Spanish
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <Link to="/admin" className="hidden items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary md:inline-flex">
              <LayoutDashboard className="h-3.5 w-3.5" /> {currentLang === "ru" ? "Админ" : currentLang === "es" ? "Admin" : "Admin"}
            </Link>
          )}
          {!user && (
            <Link to="/login" className="hidden items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground md:inline-flex">
              <LogIn className="h-4 w-4" /> {currentLang === "ru" ? "Войти" : currentLang === "es" ? "Login" : "Login"}
            </Link>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors hover:bg-secondary md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-border/60 bg-background/95 backdrop-blur-xl md:hidden">
          <ul className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6">
            {NAV_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} onClick={() => setOpen(false)} className="block rounded-md px-3 py-2 text-sm hover:bg-secondary">
                  {getLabel(l.label)}
                </Link>
              </li>
            ))}
            {/* Dynamic YouTube Link on Mobile Menu */}
            <li>
              <a
                href={activeYoutubeLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-red-500 font-semibold hover:bg-secondary"
              >
                <Youtube className="h-4 w-4" />
                {currentLang === "ru" ? "Смотреть на YouTube" : currentLang === "es" ? "Ver en YouTube" : "Watch on YouTube"}
              </a>
            </li>
            <li className="mt-2 border-t border-border/60 pt-2 flex items-center justify-around">
              <button onClick={() => { changeLanguage("en"); setOpen(false); }} className={`px-3 py-1 text-xs rounded ${currentLang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>EN</button>
              <button onClick={() => { changeLanguage("ru"); setOpen(false); }} className={`px-3 py-1 text-xs rounded ${currentLang === "ru" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>RU</button>
              <button onClick={() => { changeLanguage("es"); setOpen(false); }} className={`px-3 py-1 text-xs rounded ${currentLang === "es" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>ES</button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}