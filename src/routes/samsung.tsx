import { createFileRoute } from "@tanstack/react-router";
import { BrandPage } from "@/components/brand-page";

export const Route = createFileRoute("/samsung")({
  head: () => ({
    meta: [
      { title: "Samsung Galaxy Reviews — TechTorch" },
      { name: "description", content: "Galaxy S, Z Fold/Flip, and One UI breakdowns straight from Suwon." },
      { property: "og:title", content: "Samsung Galaxy Reviews — TechTorch" },
      { property: "og:description", content: "Galaxy S, Z Fold/Flip, and One UI breakdowns." },
    ],
  }),
  component: () => <BrandPage brand="samsung" />,
});
