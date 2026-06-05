// UI labels translated for the Reading Language toggle.
// Blog content itself uses the per-blog *_ru / *_es columns when available.

export type Lang = "en" | "ru" | "es";

export const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "ru", label: "Russian" },
  { code: "es", label: "Spanish" },
];

const dict = {
  en: {
    readingLanguage: "Reading Language",
    latestBlogs: "Latest Blogs",
    viewAll: "View All",
    readMore: "Read more",
    noPosts: "No posts yet — admin can add some from the dashboard.",
    translationPending: "Translation pending — showing English original.",
    home: "Home",
    aboutUs: "About Us",
    posts: "posts",
  },
  ru: {
    readingLanguage: "Язык чтения",
    latestBlogs: "Последние статьи",
    viewAll: "Смотреть все",
    readMore: "Читать далее",
    noPosts: "Пока нет статей — администратор может добавить их в панели.",
    translationPending: "Перевод ожидается — показан английский оригинал.",
    home: "Главная",
    aboutUs: "О нас",
    posts: "статей",
  },
  es: {
    readingLanguage: "Idioma de lectura",
    latestBlogs: "Últimas publicaciones",
    viewAll: "Ver todo",
    readMore: "Leer más",
    noPosts: "Aún no hay publicaciones — el administrador puede agregarlas.",
    translationPending: "Traducción pendiente — mostrando el original en inglés.",
    home: "Inicio",
    aboutUs: "Sobre nosotros",
    posts: "publicaciones",
  },
} as const;

export function t(lang: Lang, key: keyof typeof dict["en"]): string {
  return dict[lang][key] ?? dict.en[key];
}

export function localizedBlog<T extends {
  title: string; excerpt: string; body: string;
  title_ru: string | null; excerpt_ru: string | null; body_ru: string | null;
  title_es: string | null; excerpt_es: string | null; body_es: string | null;
}>(b: T, lang: Lang) {
  if (lang === "ru") {
    return {
      title: b.title_ru || b.title,
      excerpt: b.excerpt_ru || b.excerpt,
      body: b.body_ru || b.body,
      translated: !!(b.title_ru && b.excerpt_ru),
    };
  }
  if (lang === "es") {
    return {
      title: b.title_es || b.title,
      excerpt: b.excerpt_es || b.excerpt,
      body: b.body_es || b.body,
      translated: !!(b.title_es && b.excerpt_es),
    };
  }
  return { title: b.title, excerpt: b.excerpt, body: b.body, translated: true };
}

export function localizedBlogSummary<T extends {
  title: string; excerpt: string;
  title_ru: string | null; excerpt_ru: string | null;
  title_es: string | null; excerpt_es: string | null;
}>(b: T, lang: Lang) {
  if (lang === "ru") return { title: b.title_ru || b.title, excerpt: b.excerpt_ru || b.excerpt };
  if (lang === "es") return { title: b.title_es || b.title, excerpt: b.excerpt_es || b.excerpt };
  return { title: b.title, excerpt: b.excerpt };
}
