import { createFileRoute } from "@tanstack/react-router";
import { BrandPage } from "@/components/brand-page";

export const Route = createFileRoute("/google-pixel")({
  head: () => ({
    meta: [
      { title: "Google Pixel Reviews — TechTorch" },
      { name: "description", content: "Tensor performance, computational photography, and pure Android coverage." },
      { property: "og:title", content: "Google Pixel Reviews — TechTorch" },
      { property: "og:description", content: "Tensor, Magic Editor, and pure Android." },
    ],
  }),
  component: () => <BrandPage brand="google-pixel" />,
});
