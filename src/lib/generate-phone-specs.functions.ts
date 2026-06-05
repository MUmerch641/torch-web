import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  brand: z.enum(["iphone", "samsung", "google-pixel"]),
  model: z.string().min(1).max(120),
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

export const generatePhoneSpecs = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

    const brandLabel = data.brand === "iphone" ? "Apple iPhone" : data.brand === "samsung" ? "Samsung" : "Google Pixel";
    const prompt = `Provide realistic, concise tech specifications for the phone: "${brandLabel} ${data.model}". Return ONLY a JSON object matching this exact shape with short string values (no markdown, no extra keys):
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
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
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
      if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Workspace settings.");
      throw new Error(`AI gateway error (${res.status}): ${text.slice(0, 200)}`);
    }

    const json = await res.json();
    const content: string = json?.choices?.[0]?.message?.content ?? "{}";
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : {};
    }
    const specs = SpecsSchema.parse(parsed);
    return specs;
  });
