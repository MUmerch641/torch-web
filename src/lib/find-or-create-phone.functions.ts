import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const InputSchema = z.object({
  query: z.string().min(1).max(160),
});

const SpecsSchema = z.object({
  display: z.string(),
  chipset: z.string(),
  camera: z.string(),
  battery: z.string(),
  ram: z.string(),
  storage: z.string(),
  price: z.string(),
});

type Brand = "iphone" | "samsung" | "google-pixel";

function detectBrand(input: string): { brand: Brand; model: string } | null {
  const lower = input.toLowerCase().trim();
  if (/\b(apple|iphone)\b/.test(lower)) {
    const model = input.replace(/\b(apple|iphone)\b/gi, "").trim() || "iPhone";
    return { brand: "iphone", model };
  }
  if (/\bsamsung\b/.test(lower)) {
    const model = input.replace(/\bsamsung\b/gi, "").trim() || "Galaxy";
    return { brand: "samsung", model };
  }
  if (/\b(google|pixel)\b/.test(lower)) {
    const model = input.replace(/\b(google|pixel)\b/gi, "").trim() || "Pixel";
    return { brand: "google-pixel", model };
  }
  return null;
}

async function generateSpecs(brand: Brand, model: string) {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

  const brandLabel = brand === "iphone" ? "Apple iPhone" : brand === "samsung" ? "Samsung" : "Google Pixel";
  const prompt = `Provide realistic, concise tech specifications for the phone: "${brandLabel} ${model}". Return ONLY a JSON object matching this exact shape with short string values (no markdown, no extra keys):
{
  "display": "e.g. 6.7\\" OLED 120Hz",
  "chipset": "e.g. Snapdragon 8 Gen 3",
  "camera": "e.g. 50MP + 12MP + 10MP",
  "battery": "e.g. 5000 mAh",
  "ram": "e.g. 12GB",
  "storage": "e.g. 256GB",
  "price": "e.g. $999"
}`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "You are a phone specs expert. Always respond with valid JSON only." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) throw new Error("AI rate limit hit. Please try again shortly.");
    if (res.status === 402) throw new Error("AI credits exhausted.");
    throw new Error(`AI gateway error (${res.status}): ${text.slice(0, 200)}`);
  }

  const json = await res.json();
  const content: string = json?.choices?.[0]?.message?.content ?? "{}";
  let parsed: unknown;
  try { parsed = JSON.parse(content); } catch {
    const m = content.match(/\{[\s\S]*\}/);
    parsed = m ? JSON.parse(m[0]) : {};
  }
  return SpecsSchema.parse(parsed);
}

export const findOrCreatePhone = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const detected = detectBrand(data.query);
    if (!detected) {
      throw new Error("UNSUPPORTED_BRAND");
    }
    const { brand, model } = detected;

    // Try to find existing phone (case-insensitive match on model, same brand)
    const { data: existing, error: findErr } = await supabaseAdmin
      .from("phones")
      .select("*")
      .eq("brand", brand)
      .ilike("model", `%${model}%`)
      .limit(1)
      .maybeSingle();

    if (findErr) throw new Error(findErr.message);
    if (existing) return existing;

    // Generate and save
    const specs = await generateSpecs(brand, model);
    const { data: inserted, error: insErr } = await supabaseAdmin
      .from("phones")
      .insert({ brand, model, ...specs })
      .select()
      .single();

    if (insErr) throw new Error(insErr.message);
    return inserted;
  });
