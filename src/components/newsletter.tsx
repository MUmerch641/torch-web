import { useState, type FormEvent } from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
});

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email });
    if (!parsed.success) {
      setState("error");
      setMessage(parsed.error.issues[0].message);
      return;
    }
    setState("loading");
    const { error } = await supabase.from("newsletter_subscribers").insert({ email: parsed.data.email });
    if (error) {
      setState("error");
      setMessage(error.code === "23505" ? "You're already subscribed." : "Something went wrong. Try again.");
      return;
    }
    setState("success");
    setMessage("Subscribed! Check your inbox for tech updates.");
    setEmail("");
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="glass relative overflow-hidden rounded-3xl px-6 py-12 sm:px-12 sm:py-16">
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative mx-auto max-w-2xl text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
            <Mail className="h-5 w-5 text-primary" />
          </span>
          <h2 className="mt-5 text-3xl font-bold sm:text-4xl">Don't miss a beat.</h2>
          <p className="mt-3 text-muted-foreground">Get tech updates in your inbox. New reviews, comparisons, and rumors — every week.</p>
          <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={255}
              aria-label="Email address"
              className="flex-1 rounded-full border border-border bg-background/60 px-5 py-3 text-sm focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              disabled={state === "loading"}
              className="rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-105 disabled:opacity-50"
            >
              {state === "loading" ? "Subscribing…" : "Subscribe"}
            </button>
          </form>
          {message && (
            <p className={`mt-4 inline-flex items-center gap-1.5 text-sm ${state === "success" ? "text-primary" : "text-destructive"}`}>
              {state === "success" && <CheckCircle2 className="h-4 w-4" />}
              {message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
