import { useState, type FormEvent } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in");
        navigate({ to: "/admin" });
      } else {
        const trimmedName = fullName.trim();
        if (trimmedName.length < 2) {
          throw new Error("Please enter your full name");
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/login`,
            data: { full_name: trimmedName },
          },
        });
        if (error) throw error;
        // If email confirmation required, session will be null
        if (!data.session) {
          setEmailSent(email);
          toast.success("Confirmation email sent");
        } else {
          toast.success("Account created");
          navigate({ to: "/admin" });
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  if (emailSent) {
    return (
      <div className="grid min-h-screen place-items-center bg-hero px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/15 text-2xl">📧</div>
          <h1 className="mt-5 text-2xl font-bold">Check your inbox</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We sent a confirmation link to <span className="font-medium text-foreground">{emailSent}</span>.
            Click the link in that email, then come back here and sign in with your email & password.
          </p>
          <button
            onClick={() => { setEmailSent(null); setMode("signin"); setPassword(""); }}
            className="mt-6 w-full rounded-lg bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
          >
            Go to sign in
          </button>
          <Link to="/" className="mt-3 inline-block text-xs text-muted-foreground hover:text-foreground">← Back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen place-items-center bg-hero px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8">
        <Link to="/" className="flex items-center justify-center gap-2 text-lg font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card font-black text-primary">T</span>
          TechTorch
        </Link>
        <h1 className="mt-6 text-center text-2xl font-bold">{mode === "signin" ? "Welcome back" : "Create account"}</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          {mode === "signin" ? "Sign in to access the admin panel" : "Sign up — we'll email you a confirmation link"}
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          {mode === "signup" && (
            <input
              type="text" required minLength={2} maxLength={80}
              value={fullName} onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name" autoComplete="name"
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          )}
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com" autoComplete="email"
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
          <input
            type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 6 chars)" autoComplete={mode === "signin" ? "current-password" : "new-password"}
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02] disabled:opacity-50">
            {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>
        <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground">
          {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
        </button>
        <p className="mt-6 text-center text-xs text-muted-foreground">First registered user automatically becomes admin.</p>
      </div>
    </div>
  );
}
