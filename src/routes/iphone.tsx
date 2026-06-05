import { createFileRoute } from "@tanstack/react-router";
import { BrandPage } from "@/components/brand-page";

export const Route = createFileRoute("/iphone")({
  head: () => ({
    meta: [
      { title: "iPhone Reviews & News — TechTorch" },
      { name: "description", content: "Latest iPhone reviews, rumors, and Apple silicon deep-dives from TechTorch." },
      { property: "og:title", content: "iPhone Reviews & News — TechTorch" },
      { property: "og:description", content: "Reviews, rumors, and Apple silicon deep-dives." },
    ],
  }),
  component: () => <BrandPage brand="iphone" />,
});
