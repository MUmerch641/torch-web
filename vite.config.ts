import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const isVercel = !!process.env.VERCEL || process.env.NODE_ENV === "production"; // Default to Vercel/Node production build behavior

export default defineConfig({
  cloudflare: !isVercel,
  tanstackStart: isVercel
    ? {}
    : {
        server: { entry: "server" },
      },
});

