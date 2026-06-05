import { useState, useEffect, type FormEvent } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Edit3, Trash2, LogOut, ArrowLeft, Sparkles, Smartphone } from "lucide-react";
import { Header } from "@/components/header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { BRANDS, brandLabel, type BrandSlug } from "@/lib/site";
import { generatePhoneSpecs } from "@/lib/generate-phone-specs.functions";
import { savePhone } from "@/lib/save-phone.functions";
import { updatePhone, deletePhone } from "@/lib/update-phone.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

type Blog = {
  id: string;
  title: string; slug: string; brand: BrandSlug;
  excerpt: string; body: string;
  cover_image_url: string | null; published: boolean;
  title_ru: string | null; excerpt_ru: string | null; body_ru: string | null;
  title_es: string | null; excerpt_es: string | null; body_es: string | null;
  created_at: string;
};

function AdminPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Blog | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login" });
    }
  }, [loading, user, navigate]);

  const { data: blogs = [], refetch } = useQuery({
    queryKey: ["admin-blogs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("blogs").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Blog[];
    },
    enabled: !!user,
  });

  if (loading) return <div className="grid min-h-screen place-items-center text-muted-foreground">Loading…</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold sm:text-3xl">Admin Dashboard</h1>
            <p className="mt-1 truncate text-sm text-muted-foreground">Signed in as {user.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => { setEditing(null); setShowForm(true); }} className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-primary px-3 py-2 text-sm font-semibold text-primary-foreground sm:px-4">
              <Plus className="h-4 w-4" /> New blog
            </button>
            <button onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/" }); }} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm sm:px-4">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>

        {showForm ? (
          <BlogForm
            blog={editing}
            onCancel={() => { setShowForm(false); setEditing(null); }}
            onSaved={() => { setShowForm(false); setEditing(null); refetch(); qc.invalidateQueries(); }}
          />
        ) : (
          <div className="mt-8 overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="bg-card text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Brand</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {blogs.map((b) => (
                  <tr key={b.id} className="bg-background">
                    <td className="px-4 py-3 font-medium">{b.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{b.brand}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${b.published ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {b.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setEditing(b); setShowForm(true); }} className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm(`Delete "${b.title}"?`)) return;
                            const { error } = await supabase.from("blogs").delete().eq("id", b.id);
                            if (error) toast.error(error.message);
                            else { toast.success("Deleted"); refetch(); }
                          }}
                          className="rounded p-1.5 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {blogs.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No blogs yet. Click "New blog" to add one.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <PhoneAISection />
      </main>
    </div>
  );
}

type PhoneSpecs = {
  display: string; chipset: string; camera: string;
  battery: string; ram: string; storage: string; price: string;
};

type PhoneRow = {
  id: string; brand: BrandSlug; model: string;
  display: string | null; chipset: string | null; camera: string | null;
  battery: string | null; ram: string | null; storage: string | null; price: string | null;
};

function PhoneAISection() {
  const qc = useQueryClient();
  const generate = useServerFn(generatePhoneSpecs);
  const save = useServerFn(savePhone);
  const update = useServerFn(updatePhone);
  const remove = useServerFn(deletePhone);
  const [brand, setBrand] = useState<BrandSlug>("samsung");
  const [model, setModel] = useState("");
  const [specs, setSpecs] = useState<PhoneSpecs | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingPhone, setEditingPhone] = useState<PhoneRow | null>(null);

  const { data: phones = [], refetch } = useQuery({
    queryKey: ["admin-phones"],
    queryFn: async () => {
      const { data, error } = await supabase.from("phones").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as PhoneRow[];
    },
  });

  async function handleGenerate() {
    if (!model.trim()) { toast.error("Enter a model name"); return; }
    setLoading(true);
    try {
      const result = await generate({ data: { brand, model: model.trim() } });
      setSpecs(result);
      toast.success("Specs generated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate specs");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!specs) return;
    setSaving(true);
    try {
      await save({ data: { brand, model: model.trim(), ...specs } });
      toast.success("Phone added to comparison");
      setModel(""); setSpecs(null);
      await refetch();
      qc.invalidateQueries({ queryKey: ["phones"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save phone");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(p: PhoneRow) {
    if (!confirm(`Delete "${p.model}"?`)) return;
    try {
      await remove({ data: { id: p.id } });
      toast.success("Deleted");
      await refetch();
      qc.invalidateQueries({ queryKey: ["phones"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  const inputCls = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none";

  return (
    <section className="mt-12">
      <div className="mb-4 flex items-center gap-2">
        <Smartphone className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold">Mobiles for Comparison</h2>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold">Add New Mobile</h3>
        <p className="mt-1 text-sm text-muted-foreground">Enter the brand and model — AI will fetch the full specs.</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-[180px_1fr_auto]">
          <select value={brand} onChange={(e) => setBrand(e.target.value as BrandSlug)} className={inputCls}>
            {BRANDS.map((b) => <option key={b.slug} value={b.slug}>{b.label}</option>)}
          </select>
          <input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="e.g. Galaxy S24 Ultra"
            className={inputCls}
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            {loading ? "Generating…" : "Generate Specs with AI"}
          </button>
        </div>

        {specs && (
          <div className="mt-5 rounded-xl border border-border bg-background p-4">
            <div className="mb-3 text-sm font-semibold">{brandLabel(brand)} {model}</div>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              {(Object.keys(specs) as (keyof PhoneSpecs)[]).map((k) => (
                <div key={k} className="flex items-baseline gap-2">
                  <span className="w-20 shrink-0 text-xs uppercase text-muted-foreground">{k}</span>
                  <input
                    value={specs[k]}
                    onChange={(e) => setSpecs({ ...specs, [k]: e.target.value })}
                    className={inputCls}
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={handleSave} disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                {saving ? "Saving…" : "Save to Comparison"}
              </button>
              <button onClick={() => setSpecs(null)} className="rounded-lg border border-border px-4 py-2 text-sm">Discard</button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-card text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Model</th>
              <th className="px-4 py-3">Brand</th>
              <th className="px-4 py-3">Chipset</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {phones.map((p) => (
              <tr key={p.id} className="bg-background">
                <td className="px-4 py-3 font-medium">{p.model}</td>
                <td className="px-4 py-3 text-muted-foreground">{brandLabel(p.brand)}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.chipset ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.price ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingPhone(p)}
                      className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                      aria-label="Edit"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      className="rounded p-1.5 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {phones.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No mobiles yet. Add one above.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editingPhone && (
        <EditPhoneModal
          phone={editingPhone}
          onClose={() => setEditingPhone(null)}
          onSave={async (updated) => {
            try {
              await update({ data: updated });
              toast.success("Phone updated");
              setEditingPhone(null);
              await refetch();
              qc.invalidateQueries({ queryKey: ["phones"] });
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Failed to update");
            }
          }}
        />
      )}
    </section>
  );
}

function EditPhoneModal({ phone, onClose, onSave }: {
  phone: PhoneRow;
  onClose: () => void;
  onSave: (data: { id: string; brand: BrandSlug; model: string } & PhoneSpecs) => Promise<void>;
}) {
  const [form, setForm] = useState({
    brand: phone.brand,
    model: phone.model,
    display: phone.display ?? "",
    chipset: phone.chipset ?? "",
    camera: phone.camera ?? "",
    battery: phone.battery ?? "",
    ram: phone.ram ?? "",
    storage: phone.storage ?? "",
    price: phone.price ?? "",
  });
  const [saving, setSaving] = useState(false);
  const inputCls = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none";

  async function submit() {
    if (!form.model.trim()) { toast.error("Model required"); return; }
    setSaving(true);
    try {
      await onSave({ id: phone.id, ...form });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold">Edit Phone</h3>
        <p className="mt-1 text-sm text-muted-foreground">Update any field and save changes.</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Brand</span>
            <select value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value as BrandSlug })} className={inputCls}>
              {BRANDS.map((b) => <option key={b.slug} value={b.slug}>{b.label}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Model</span>
            <input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className={inputCls} />
          </label>
          {(["display","chipset","camera","battery","ram","storage","price"] as const).map((k) => (
            <label key={k} className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase text-muted-foreground">{k}</span>
              <input value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className={inputCls} />
            </label>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm">Cancel</button>
          <button onClick={submit} disabled={saving} className="rounded-lg bg-gradient-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function BlogForm({ blog, onCancel, onSaved }: { blog: Blog | null; onCancel: () => void; onSaved: () => void }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: blog?.title ?? "",
    slug: blog?.slug ?? "",
    brand: blog?.brand ?? ("iphone" as BrandSlug),
    excerpt: blog?.excerpt ?? "",
    body: blog?.body ?? "",
    cover_image_url: blog?.cover_image_url ?? "",
    published: blog?.published ?? true,
    title_ru: blog?.title_ru ?? "",
    excerpt_ru: blog?.excerpt_ru ?? "",
    body_ru: blog?.body_ru ?? "",
    title_es: blog?.title_es ?? "",
    excerpt_es: blog?.excerpt_es ?? "",
    body_es: blog?.body_es ?? "",
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      slug: form.slug.trim() || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      title_ru: form.title_ru || null, excerpt_ru: form.excerpt_ru || null, body_ru: form.body_ru || null,
      title_es: form.title_es || null, excerpt_es: form.excerpt_es || null, body_es: form.body_es || null,
      cover_image_url: form.cover_image_url || null,
      author_id: user?.id ?? null,
    };
    const { error } = blog
      ? await supabase.from("blogs").update(payload).eq("id", blog.id)
      : await supabase.from("blogs").insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(blog ? "Updated" : "Created");
    onSaved();
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const { error: upErr } = await supabase.storage.from("blog-covers").upload(path, file);
    if (upErr) { toast.error(upErr.message); return; }
    const { data } = supabase.storage.from("blog-covers").getPublicUrl(path);
    setForm((f) => ({ ...f, cover_image_url: data.publicUrl }));
    toast.success("Image uploaded");
  }

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
  const inputCls = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-2xl border border-border bg-card p-6">
      <button type="button" onClick={onCancel} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> Back to list
      </button>
      <h2 className="text-xl font-bold">{blog ? "Edit blog" : "New blog"}</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title"><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} /></Field>
        <Field label="Slug (auto if blank)"><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputCls} placeholder="iphone-15-review" /></Field>
        <Field label="Brand">
          <select value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value as BrandSlug })} className={inputCls}>
            {BRANDS.map((b) => <option key={b.slug} value={b.slug}>{b.label}</option>)}
          </select>
        </Field>
        <Field label="Cover image">
          <div className="flex items-center gap-2">
            <input type="file" accept="image/*" onChange={handleUpload} className="text-xs text-muted-foreground" />
            {form.cover_image_url && <img src={form.cover_image_url} alt="" className="h-10 w-10 rounded object-cover" />}
          </div>
        </Field>
      </div>
      <Field label="Excerpt"><textarea required rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className={inputCls} /></Field>
      <Field label="Body"><textarea required rows={10} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className={inputCls} /></Field>

      <details className="rounded-lg border border-border p-4">
        <summary className="cursor-pointer text-sm font-medium">Russian translation (optional)</summary>
        <div className="mt-4 space-y-3">
          <Field label="Title (RU)"><input value={form.title_ru} onChange={(e) => setForm({ ...form, title_ru: e.target.value })} className={inputCls} /></Field>
          <Field label="Excerpt (RU)"><textarea rows={2} value={form.excerpt_ru} onChange={(e) => setForm({ ...form, excerpt_ru: e.target.value })} className={inputCls} /></Field>
          <Field label="Body (RU)"><textarea rows={6} value={form.body_ru} onChange={(e) => setForm({ ...form, body_ru: e.target.value })} className={inputCls} /></Field>
        </div>
      </details>
      <details className="rounded-lg border border-border p-4">
        <summary className="cursor-pointer text-sm font-medium">Spanish translation (optional)</summary>
        <div className="mt-4 space-y-3">
          <Field label="Title (ES)"><input value={form.title_es} onChange={(e) => setForm({ ...form, title_es: e.target.value })} className={inputCls} /></Field>
          <Field label="Excerpt (ES)"><textarea rows={2} value={form.excerpt_es} onChange={(e) => setForm({ ...form, excerpt_es: e.target.value })} className={inputCls} /></Field>
          <Field label="Body (ES)"><textarea rows={6} value={form.body_es} onChange={(e) => setForm({ ...form, body_es: e.target.value })} className={inputCls} /></Field>
        </div>
      </details>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
        Published
      </label>

      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="rounded-lg bg-gradient-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
          {saving ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-border px-5 py-2 text-sm">Cancel</button>
      </div>
    </form>
  );
}
