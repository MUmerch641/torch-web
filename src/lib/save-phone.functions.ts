import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const InputSchema = z.object({
  brand: z.enum(["iphone", "samsung", "google-pixel"]),
  model: z.string().min(1).max(160),
  display: z.string().max(200),
  chipset: z.string().max(200),
  camera: z.string().max(200),
  battery: z.string().max(200),
  ram: z.string().max(200),
  storage: z.string().max(200),
  price: z.string().max(200),
});

export const savePhone = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;

    // Verify admin role server-side
    const { data: roleRow, error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (roleErr) throw new Error(roleErr.message);
    if (!roleRow) throw new Error("Forbidden: admin role required to add phones.");

    const { data: inserted, error } = await supabaseAdmin
      .from("phones")
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return inserted;
  });
