import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";

const isVercel = !!process.env.VERCEL || process.env.NODE_ENV === "production"; // Default to Vercel/Node production build behavior

export default defineConfig({
  cloudflare: !isVercel,
  plugins: isVercel ? [nitro()] : [],
  tanstackStart: isVercel
    ? {}
    : {
        server: { entry: "server" },
      },
});

