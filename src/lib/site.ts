export const BRANDS = [
  { slug: "iphone" as const, label: "iPhone", route: "/iphone" as const },
  { slug: "samsung" as const, label: "Samsung", route: "/samsung" as const },
  { slug: "google-pixel" as const, label: "Google Pixel", route: "/google-pixel" as const },
];

export const YOUTUBE_URL = "https://www.youtube.com/";
export const SITE_NAME = "TechTorch";
export const SITE_TAGLINE = "The Future of Tech in Your Hands";

export type BrandSlug = "iphone" | "samsung" | "google-pixel";

export function brandLabel(slug: BrandSlug): string {
  return BRANDS.find((b) => b.slug === slug)?.label ?? slug;
}
