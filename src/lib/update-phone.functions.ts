import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const UpdateSchema = z.object({
  id: z.string().uuid(),
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

async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required.");
}

export const updatePhone = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => UpdateSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { id, ...rest } = data;
    const { data: updated, error } = await supabaseAdmin
      .from("phones")
      .update(rest)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return updated;
  });

export const deletePhone = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.from("phones").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
