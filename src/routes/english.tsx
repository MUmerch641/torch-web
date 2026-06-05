import { createFileRoute } from "@tanstack/react-router";
import { LanguagePage } from "@/components/language-page";

export const Route = createFileRoute("/english")({
  head: () => ({ meta: [{ title: "English Blogs — TechTorch" }, { name: "description", content: "All TechTorch blogs in English." }] }),
  component: () => <LanguagePage lang="en" />,
});
