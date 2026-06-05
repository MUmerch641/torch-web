import { createFileRoute } from "@tanstack/react-router";
import { LanguagePage } from "@/components/language-page";

export const Route = createFileRoute("/russian")({
  head: () => ({ meta: [{ title: "Русские блоги — TechTorch" }, { name: "description", content: "Все блоги TechTorch на русском." }] }),
  component: () => <LanguagePage lang="ru" />,
});
