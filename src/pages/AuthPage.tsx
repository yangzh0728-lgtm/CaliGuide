import { FormEvent, useState } from "react";
import { KeyRound, LockKeyhole, LogIn, Mail, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

export default function AuthPage() {
  const { isPasswordRecovery, login, register, requestPasswordReset, resetRecoveredPassword } = useAuth();
  const { t } = useLanguage();
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegistering = mode === "register";
  const isForgotPassword = mode === "forgot";
  const isResettingPassword = isPasswordRecovery;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setIsSubmitting(true);

    try {
      if (isResettingPassword) {
        await resetRecoveredPassword({ newPassword: password });
        setNotice("Your password has been updated. You can continue using CaliGuide.");
        setPassword("");
      } else if (isForgotPassword) {
        await requestPasswordReset({ email });
        setNotice("Password reset email sent. Check your inbox and follow the link.");
      } else if (isRegistering) {
        await register({ name, email, password });
      } else {
        await login({ email, password });
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10 flex items-center justify-center">
      <main className="w-full max-w-md">
        <section className="mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg mb-5">
            {isResettingPassword || isForgotPassword ? (
              <KeyRound size={28} />
            ) : isRegistering ? (
              <UserPlus size={28} />
            ) : (
              <LogIn size={28} />
            )}
          </div>
          <h1 className="text-3xl font-bold text-on-surface">
            {isResettingPassword
              ? "Reset your password"
              : isForgotPassword
                ? "Forgot password?"
                : isRegistering
                  ? t("auth.createAccount")
                  : t("auth.welcome")}
          </h1>
          <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
            {isResettingPassword
              ? "Enter a new password for your CaliGuide account."
              : isForgotPassword
                ? "Enter your email and we will send a secure password reset link."
                : isRegistering
              ? t("auth.registerCopy")
              : t("auth.loginCopy")}
          </p>
        </section>

        <form onSubmit={handleSubmit} className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm space-y-4">
          {!isResettingPassword && (
            <div className="grid grid-cols-2 gap-2 bg-surface-container-low rounded-xl p-1">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setNotice("");
                }}
                className={`py-2.5 rounded-lg text-sm font-bold transition-colors ${
                  !isRegistering && !isForgotPassword ? "bg-white text-primary shadow-sm" : "text-on-surface-variant"
                }`}
              >
                {t("auth.login")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError("");
                  setNotice("");
                }}
                className={`py-2.5 rounded-lg text-sm font-bold transition-colors ${
                  isRegistering ? "bg-white text-primary shadow-sm" : "text-on-surface-variant"
                }`}
              >
                {t("auth.register")}
              </button>
            </div>
          )}

          {isRegistering && !isResettingPassword && (
            <label className="block">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">{t("auth.name")}</span>
              <div className="mt-2 flex items-center gap-3 border border-outline-variant rounded-xl px-3 focus-within:border-primary">
                <UserPlus size={18} className="text-on-surface-variant" />
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full py-3 bg-transparent outline-none text-sm"
                  placeholder={t("auth.namePlaceholder")}
                />
              </div>
            </label>
          )}

          {!isResettingPassword && (
            <label className="block">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">{t("auth.email")}</span>
            <div className="mt-2 flex items-center gap-3 border border-outline-variant rounded-xl px-3 focus-within:border-primary">
              <Mail size={18} className="text-on-surface-variant" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full py-3 bg-transparent outline-none text-sm"
                placeholder={t("auth.emailPlaceholder")}
              />
            </div>
            </label>
          )}

          {!isForgotPassword && (
            <label className="block">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">
              {isResettingPassword ? "New password" : t("auth.password")}
            </span>
            <div className="mt-2 flex items-center gap-3 border border-outline-variant rounded-xl px-3 focus-within:border-primary">
              <LockKeyhole size={18} className="text-on-surface-variant" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full py-3 bg-transparent outline-none text-sm"
                placeholder={t("auth.passwordPlaceholder")}
              />
            </div>
            </label>
          )}

          {error && (
            <p className="rounded-xl bg-error/10 border border-error/20 px-3 py-2 text-sm font-semibold text-error">
              {error}
            </p>
          )}

          {notice && (
            <p className="rounded-xl bg-primary/10 border border-primary/20 px-3 py-2 text-sm font-semibold text-primary">
              {notice}
            </p>
          )}

          <button
            disabled={isSubmitting}
            className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Please wait..."
              : isResettingPassword
                ? "Update password"
                : isForgotPassword
                  ? "Send reset email"
                  : isRegistering
                    ? t("auth.submitRegister")
                    : t("auth.login")}
          </button>

          {!isResettingPassword && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setMode(isForgotPassword ? "login" : "forgot");
                  setError("");
                  setNotice("");
                }}
                className="text-sm font-bold text-primary hover:underline"
              >
                {isForgotPassword ? "Back to login" : "Forgot password?"}
              </button>
            </div>
          )}
        </form>
      </main>
    </div>
  );
}
