import { FormEvent, useState } from "react";
import { Chrome, KeyRound, LockKeyhole, LogIn, Mail, UserPlus } from "lucide-react";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { getUserFacingError } from "../lib/userFacingErrors";
import { WORKFLOW_COPY } from "../i18n/workflowCopy";

import LegalFooter from "../components/LegalFooter";
import { LegalPageId } from "../lib/legalContent";

interface AuthPageProps {
  onOpenLegalPage: (pageId: LegalPageId) => void;
  onContinueBrowsing?: () => void;
  continueBrowsingHref?: string;
}

export default function AuthPage({
  onOpenLegalPage,
  onContinueBrowsing,
  continueBrowsingHref = "/",
}: AuthPageProps) {
  const { isPasswordRecovery, login, loginWithGoogle, register, requestPasswordReset, resetRecoveredPassword } = useAuth();
  const { t, language } = useLanguage();
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [registerMethod, setRegisterMethod] = useState<"email" | "google" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegistering = mode === "register";
  const isForgotPassword = mode === "forgot";
  const isResettingPassword = isPasswordRecovery;
  const isChoosingRegisterMethod = isRegistering && !registerMethod;
  const showEmailField =
    !isResettingPassword && (!isRegistering || registerMethod === "email" || isForgotPassword);
  const showPasswordField = !isForgotPassword && (!isRegistering || registerMethod === "email" || isResettingPassword);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setIsSubmitting(true);

    try {
      if (isResettingPassword) {
        await resetRecoveredPassword({ newPassword: password });
        setNotice(t("auth.passwordUpdatedNotice"));
        setPassword("");
      } else if (isForgotPassword) {
        await requestPasswordReset({ email });
        setNotice(t("auth.resetEmailSentNotice"));
      } else if (isRegistering) {
        if (registerMethod === "google") {
          await loginWithGoogle();
          return;
        }
        if (registerMethod !== "email") {
          throw new Error(t("auth.chooseSignUpMethod"));
        }
        const result = await register({ email, password });
        if (result.confirmationRequired) {
          setNotice(t("auth.confirmEmailNotice"));
          setMode("login");
          setPassword("");
        }
      } else {
        await login({ email, password });
      }
    } catch (authError) {
      setError(getUserFacingError(authError, language));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setNotice("");
    setIsSubmitting(true);

    try {
      await loginWithGoogle();
    } catch (authError) {
      setError(getUserFacingError(authError, language));
      setIsSubmitting(false);
    }
  };

  const resetFeedback = () => {
    setError("");
    setNotice("");
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div className="absolute right-4 top-4 z-20 rounded-full bg-white/80 shadow-sm backdrop-blur-sm">
        <LanguageSwitcher />
      </div>
      <div className="flex flex-1 items-center justify-center px-4 py-10">
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
              ? t("auth.resetPasswordTitle")
              : isForgotPassword
                ? t("auth.forgotPasswordTitle")
                : isRegistering
                  ? t("auth.createAccount")
                  : t("auth.welcome")}
          </h1>
          <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
            {isResettingPassword
              ? t("auth.resetPasswordCopy")
              : isForgotPassword
                ? t("auth.forgotPasswordCopy")
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
                  setRegisterMethod(null);
                  resetFeedback();
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
                  setRegisterMethod(null);
                  resetFeedback();
                }}
                className={`py-2.5 rounded-lg text-sm font-bold transition-colors ${
                  isRegistering ? "bg-white text-primary shadow-sm" : "text-on-surface-variant"
                }`}
              >
                {t("auth.register")}
              </button>
            </div>
          )}

          {isChoosingRegisterMethod && (
            <section className="space-y-3">
              <p className="text-sm font-semibold text-on-surface-variant">{t("auth.chooseSignUpMethod")}</p>
              <button
                type="button"
                onClick={() => {
                  setRegisterMethod("email");
                  resetFeedback();
                }}
                className="flex w-full items-center gap-3 rounded-2xl border border-outline-variant bg-white p-4 text-left transition-colors hover:border-primary hover:bg-surface-container-low"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-container-low text-primary">
                  <Mail size={22} />
                </span>
                <span>
                  <span className="block text-sm font-bold text-on-surface">{t("auth.signUpWithEmail")}</span>
                  <span className="mt-1 block text-xs leading-5 text-on-surface-variant">
                    {WORKFLOW_COPY[language].optionalCopy}
                  </span>
                </span>
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  void handleGoogleLogin();
                }}
                className="flex w-full items-center gap-3 rounded-2xl border border-outline-variant bg-white p-4 text-left transition-colors hover:border-primary hover:bg-surface-container-low"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-container-low text-primary">
                  <Chrome size={22} />
                </span>
                <span>
                  <span className="block text-sm font-bold text-on-surface">{t("auth.signUpWithGoogle")}</span>
                  <span className="mt-1 block text-xs leading-5 text-on-surface-variant">
                    {WORKFLOW_COPY[language].optionalCopy}
                  </span>
                </span>
              </button>
            </section>
          )}

          {!isRegistering && !isForgotPassword && !isResettingPassword && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleGoogleLogin}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-outline-variant bg-white py-3 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Chrome size={18} />
              {t("auth.continueWithGoogle")}
            </button>
          )}

          {showEmailField && (
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

          {showPasswordField && (
            <label className="block">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">
              {isResettingPassword ? t("auth.newPassword") : t("auth.password")}
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
            type="submit"
            disabled={isSubmitting}
            hidden={isChoosingRegisterMethod}
            className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? t("auth.pleaseWait")
              : isResettingPassword
                ? t("auth.updatePassword")
                : isForgotPassword
                  ? t("auth.sendResetEmail")
                  : isRegistering
                    ? registerMethod === "google"
                      ? t("auth.continueWithGoogle")
                      : t("auth.submitRegister")
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
                {isForgotPassword ? t("auth.backToLogin") : t("auth.forgotPassword")}
              </button>
            </div>
          )}
        </form>
        {onContinueBrowsing ? (
          <a
            href={`${continueBrowsingHref}${continueBrowsingHref.includes("?") ? "&" : "?"}continue=1`}
            className="mt-4 block w-full rounded-xl px-4 py-3 text-center text-sm font-bold text-primary transition-colors hover:bg-surface-container-low"
          >
            {t("auth.continueBrowsing")}
          </a>
        ) : null}
      </main>
      </div>
      <LegalFooter onOpenLegalPage={onOpenLegalPage} compact />
    </div>
  );
}
