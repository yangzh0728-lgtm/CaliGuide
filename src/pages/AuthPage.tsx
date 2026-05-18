import { FormEvent, useState } from "react";
import { LockKeyhole, LogIn, Mail, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const isRegistering = mode === "register";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      if (isRegistering) {
        register({ name, email, password });
      } else {
        login({ email, password });
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10 flex items-center justify-center">
      <main className="w-full max-w-md">
        <section className="mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg mb-5">
            {isRegistering ? <UserPlus size={28} /> : <LogIn size={28} />}
          </div>
          <h1 className="text-3xl font-bold text-on-surface">
            {isRegistering ? "Create your CaliGuide account" : "Welcome back"}
          </h1>
          <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
            {isRegistering
              ? "Save guides, manage documents, and keep your immigration profile close at hand."
              : "Sign in to continue managing your guides, profile, and saved resources."}
          </p>
        </section>

        <form onSubmit={handleSubmit} className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-2 gap-2 bg-surface-container-low rounded-xl p-1">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className={`py-2.5 rounded-lg text-sm font-bold transition-colors ${
                !isRegistering ? "bg-white text-primary shadow-sm" : "text-on-surface-variant"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError("");
              }}
              className={`py-2.5 rounded-lg text-sm font-bold transition-colors ${
                isRegistering ? "bg-white text-primary shadow-sm" : "text-on-surface-variant"
              }`}
            >
              Register
            </button>
          </div>

          {isRegistering && (
            <label className="block">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Name</span>
              <div className="mt-2 flex items-center gap-3 border border-outline-variant rounded-xl px-3 focus-within:border-primary">
                <UserPlus size={18} className="text-on-surface-variant" />
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full py-3 bg-transparent outline-none text-sm"
                  placeholder="Elena Rodriguez"
                />
              </div>
            </label>
          )}

          <label className="block">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Email</span>
            <div className="mt-2 flex items-center gap-3 border border-outline-variant rounded-xl px-3 focus-within:border-primary">
              <Mail size={18} className="text-on-surface-variant" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full py-3 bg-transparent outline-none text-sm"
                placeholder="you@example.com"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Password</span>
            <div className="mt-2 flex items-center gap-3 border border-outline-variant rounded-xl px-3 focus-within:border-primary">
              <LockKeyhole size={18} className="text-on-surface-variant" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full py-3 bg-transparent outline-none text-sm"
                placeholder="At least 6 characters"
              />
            </div>
          </label>

          {error && (
            <p className="rounded-xl bg-error/10 border border-error/20 px-3 py-2 text-sm font-semibold text-error">
              {error}
            </p>
          )}

          <button className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:opacity-90 transition-opacity">
            {isRegistering ? "Create account" : "Login"}
          </button>
        </form>
      </main>
    </div>
  );
}
