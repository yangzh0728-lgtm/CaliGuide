import { FormEvent, useState } from "react";
import { CalendarDays, Chrome, Flag, KeyRound, LockKeyhole, LogIn, Mail, MapPin, Plane, Plus, Trash2, UserPlus, UsersRound } from "lucide-react";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { ArrivalStatusOption, SexOption } from "../lib/authStore";
import { COUNTRY_OPTIONS } from "../lib/nationalities";

export default function AuthPage() {
  const { isPasswordRecovery, login, loginWithGoogle, register, requestPasswordReset, resetRecoveredPassword } = useAuth();
  const { t } = useLanguage();
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [registerMethod, setRegisterMethod] = useState<"email" | "google" | null>(null);
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [sex, setSex] = useState<SexOption>("prefer_not_to_say");
  const [nationalities, setNationalities] = useState([""]);
  const [currentLocation, setCurrentLocation] = useState("");
  const [arrivalStatus, setArrivalStatus] = useState<ArrivalStatusOption>("planning");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegistering = mode === "register";
  const isForgotPassword = mode === "forgot";
  const isResettingPassword = isPasswordRecovery;
  const isChoosingRegisterMethod = isRegistering && !registerMethod;
  const showRegistrationProfile = isRegistering && !!registerMethod && !isResettingPassword;
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
          await loginWithGoogle({
            name,
            dateOfBirth,
            sex,
            nationalities,
            currentLocation,
            arrivalStatus,
          });
          return;
        }
        if (registerMethod !== "email") {
          throw new Error(t("auth.chooseSignUpMethod"));
        }
        const result = await register({
          name,
          email,
          password,
          dateOfBirth,
          sex,
          nationalities,
          currentLocation,
          arrivalStatus,
        });
        if (result.confirmationRequired) {
          setNotice(t("auth.confirmEmailNotice"));
          setMode("login");
          setPassword("");
        }
      } else {
        await login({ email, password });
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : t("auth.genericError"));
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
      setError(authError instanceof Error ? authError.message : t("auth.genericError"));
      setIsSubmitting(false);
    }
  };

  const resetFeedback = () => {
    setError("");
    setNotice("");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="absolute right-4 top-4 z-20 rounded-full bg-white/80 shadow-sm backdrop-blur-sm">
        <LanguageSwitcher />
      </div>
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
                    {t("auth.emailRegisterNotice")}
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRegisterMethod("google");
                  resetFeedback();
                }}
                className="flex w-full items-center gap-3 rounded-2xl border border-outline-variant bg-white p-4 text-left transition-colors hover:border-primary hover:bg-surface-container-low"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-container-low text-primary">
                  <Chrome size={22} />
                </span>
                <span>
                  <span className="block text-sm font-bold text-on-surface">{t("auth.signUpWithGoogle")}</span>
                  <span className="mt-1 block text-xs leading-5 text-on-surface-variant">
                    {t("auth.googleRegisterNotice")}
                  </span>
                </span>
              </button>
            </section>
          )}

          {showRegistrationProfile && (
            <>
              <div className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-low px-3 py-2">
                <p className="text-xs font-bold text-on-surface-variant">
                  {registerMethod === "google" ? t("auth.signUpWithGoogle") : t("auth.signUpWithEmail")}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setRegisterMethod(null);
                    resetFeedback();
                  }}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  {t("auth.backToSignUpOptions")}
                </button>
              </div>
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

              <label className="block">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">{t("auth.dateOfBirth")}</span>
                <div className="mt-2 flex items-center gap-3 border border-outline-variant rounded-xl px-3 focus-within:border-primary">
                  <CalendarDays size={18} className="text-on-surface-variant" />
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(event) => setDateOfBirth(event.target.value)}
                    max={new Date().toISOString().slice(0, 10)}
                    required={isRegistering}
                    className="w-full py-3 bg-transparent outline-none text-sm"
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">{t("auth.sex")}</span>
                <div className="mt-2 flex items-center gap-3 border border-outline-variant rounded-xl px-3 focus-within:border-primary">
                  <UsersRound size={18} className="text-on-surface-variant" />
                  <select
                    value={sex}
                    onChange={(event) => setSex(event.target.value as SexOption)}
                    className="w-full py-3 bg-transparent outline-none text-sm"
                  >
                    <option value="male">{t("auth.sexMale")}</option>
                    <option value="female">{t("auth.sexFemale")}</option>
                    <option value="prefer_not_to_say">{t("auth.sexPreferNotToSay")}</option>
                  </select>
                </div>
              </label>

              <label className="block">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">{t("auth.countryNationality")}</span>
                <div className="mt-2 space-y-2">
                  {nationalities.map((nationality, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 border border-outline-variant rounded-xl px-3 focus-within:border-primary"
                    >
                      <Flag size={18} className="text-on-surface-variant" />
                      <select
                        value={nationality}
                        onChange={(event) =>
                          setNationalities((current) =>
                            current.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)),
                          )
                        }
                        required={isRegistering && index === 0}
                        className="w-full py-3 bg-transparent outline-none text-sm"
                      >
                        <option value="">{t("auth.countryNationalityPlaceholder")}</option>
                        {COUNTRY_OPTIONS.map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                      {nationalities.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setNationalities((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                          className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high"
                          aria-label={t("auth.removeNationality")}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setNationalities((current) => [...current, ""])}
                    className="inline-flex items-center gap-2 rounded-xl bg-surface-container-low px-3 py-2 text-sm font-bold text-primary hover:bg-surface-container-high"
                  >
                    <Plus size={16} />
                    {t("auth.addNationality")}
                  </button>
                </div>
              </label>

              <label className="block">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">{t("auth.currentLocation")}</span>
                <div className="mt-2 flex items-center gap-3 border border-outline-variant rounded-xl px-3 focus-within:border-primary">
                  <MapPin size={18} className="text-on-surface-variant" />
                  <input
                    value={currentLocation}
                    onChange={(event) => setCurrentLocation(event.target.value)}
                    required={isRegistering}
                    className="w-full py-3 bg-transparent outline-none text-sm"
                    placeholder={t("auth.currentLocationPlaceholder")}
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">{t("auth.arrivalStatus")}</span>
                <div className="mt-2 flex items-center gap-3 border border-outline-variant rounded-xl px-3 focus-within:border-primary">
                  <Plane size={18} className="text-on-surface-variant" />
                  <select
                    value={arrivalStatus}
                    onChange={(event) => setArrivalStatus(event.target.value as ArrivalStatusOption)}
                    className="w-full py-3 bg-transparent outline-none text-sm"
                  >
                    <option value="planning">{t("auth.arrivalPlanning")}</option>
                    <option value="arrived">{t("auth.arrivalArrived")}</option>
                    <option value="long_term_resident">{t("auth.arrivalLongTermResident")}</option>
                  </select>
                </div>
              </label>
            </>
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
      </main>
    </div>
  );
}
