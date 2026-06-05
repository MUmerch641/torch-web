import { createFileRoute } from "@tanstack/react-router";
import { LanguagePage } from "@/components/language-page";

export const Route = createFileRoute("/spanish")({
  head: () => ({ meta: [{ title: "Blogs en español — TechTorch" }, { name: "description", content: "Todos los blogs de TechTorch en español." }] }),
  component: () => <LanguagePage lang="es" />,
});
