import type { LanguageCode } from "./translations";

const en = {
  report: "Report incorrect information", reason: "Reason", section: "Section", wholeGuide: "Whole guide",
  details: "What happened when you tried this?", privacy: "Do not include private documents or account numbers.",
  outdated: "Outdated information", incorrect: "Factually incorrect", broken_link: "Broken official link",
  translation: "Translation error", confusing: "Confusing or unclear", cancel: "Cancel", submit: "Submit report",
  sending: "Submitting...", success: "Thank you. Your report was added to the review queue.", close: "Close",
  failed: "Something went wrong. Please try again.", rateLimited: "Too many requests. Please wait and try again.",
  network: "Unable to connect. Check your connection and try again.", credentials: "Check your email and password.",
  confirmEmail: "Confirm your email before signing in.", email: "Enter a valid email address.",
  password: "Use a password with at least 6 characters.", name: "Enter a display name.", birthDate: "Enter a valid date of birth.",
  signIn: "Please sign in again to continue.", image: "Choose a supported image within the upload size limit.",
  optionalProfile: "Profile details (optional)", optionalCopy: "You can add or change these details in Settings later.",
  syncFailed: "Progress could not be saved to your account. Retry before leaving this page.",
  loadFailed: "Your saved progress could not be loaded. Please retry.", retry: "Retry", saving: "Saving...",
};
type Copy = typeof en;
const zhCN: Copy = {
  report: "报告错误信息", reason: "原因", section: "章节", wholeGuide: "整篇指南", details: "你尝试办理时遇到了什么情况？",
  privacy: "请勿填写私人文件或账户号码。", outdated: "信息已过时", incorrect: "事实错误", broken_link: "官方链接失效",
  translation: "翻译错误", confusing: "内容不清楚", cancel: "取消", submit: "提交报告", sending: "正在提交…",
  success: "谢谢，你的报告已加入审核队列。", close: "关闭", failed: "操作未完成，请重试。", rateLimited: "请求过多，请稍后再试。",
  network: "无法连接，请检查网络后重试。", credentials: "请检查邮箱和密码。", confirmEmail: "请先验证邮箱再登录。",
  email: "请输入有效的邮箱地址。", password: "密码至少需要 6 个字符。", name: "请输入显示名称。", birthDate: "请输入有效的出生日期。",
  signIn: "请重新登录后继续。", image: "请选择支持的图片格式，并确认文件大小未超出限制。", optionalProfile: "个人资料（选填）",
  optionalCopy: "你可以稍后在设置中添加或修改这些资料。", syncFailed: "进度未能保存到账户，请在离开此页前重试。",
  loadFailed: "无法加载已保存的进度，请重试。", retry: "重试", saving: "正在保存…",
};
const zhTW: Copy = {
  report: "回報錯誤資訊", reason: "原因", section: "章節", wholeGuide: "整篇指南", details: "你嘗試辦理時遇到了什麼情況？",
  privacy: "請勿填寫私人文件或帳號。", outdated: "資訊已過時", incorrect: "事實錯誤", broken_link: "官方連結失效",
  translation: "翻譯錯誤", confusing: "內容不清楚", cancel: "取消", submit: "提交回報", sending: "正在提交…",
  success: "謝謝，你的回報已加入審核佇列。", close: "關閉", failed: "操作未完成，請重試。", rateLimited: "請求過多，請稍後再試。",
  network: "無法連線，請檢查網路後重試。", credentials: "請檢查電子郵件和密碼。", confirmEmail: "請先驗證電子郵件再登入。",
  email: "請輸入有效的電子郵件地址。", password: "密碼至少需要 6 個字元。", name: "請輸入顯示名稱。", birthDate: "請輸入有效的出生日期。",
  signIn: "請重新登入後繼續。", image: "請選擇支援的圖片格式，並確認檔案大小未超過限制。", optionalProfile: "個人資料（選填）",
  optionalCopy: "你可以稍後在設定中新增或修改這些資料。", syncFailed: "進度未能儲存至帳戶，請在離開此頁前重試。",
  loadFailed: "無法載入已儲存的進度，請重試。", retry: "重試", saving: "正在儲存…",
};
const yue: Copy = {
  ...zhTW, report: "報告錯誤資訊", details: "你嘗試辦理嗰陣遇到咩情況？", privacy: "請唔好填私人文件或帳戶號碼。",
  success: "多謝，你嘅報告已加入審核隊列。", network: "連唔到線，請檢查網絡再試。", credentials: "請檢查電郵同密碼。",
  confirmEmail: "請先確認電郵再登入。", email: "請輸入有效嘅電郵地址。", optionalCopy: "你可以遲啲喺設定加入或修改呢啲資料。",
  syncFailed: "進度未能儲存到帳戶，請喺離開呢頁之前再試。", loadFailed: "載入唔到已儲存嘅進度，請再試。", retry: "再試",
};
const es: Copy = {
  report: "Informar de información incorrecta", reason: "Motivo", section: "Sección", wholeGuide: "Toda la guía",
  details: "¿Qué ocurrió cuando lo intentaste?", privacy: "No incluyas documentos privados ni números de cuenta.",
  outdated: "Información desactualizada", incorrect: "Dato incorrecto", broken_link: "Enlace oficial roto", translation: "Error de traducción",
  confusing: "Contenido confuso", cancel: "Cancelar", submit: "Enviar informe", sending: "Enviando…",
  success: "Gracias. Tu informe se ha añadido a la cola de revisión.", close: "Cerrar", failed: "No se pudo completar la operación. Inténtalo de nuevo.",
  rateLimited: "Demasiadas solicitudes. Espera e inténtalo de nuevo.", network: "No se pudo conectar. Revisa tu conexión e inténtalo de nuevo.",
  credentials: "Comprueba tu correo y contraseña.", confirmEmail: "Confirma tu correo antes de iniciar sesión.", email: "Introduce un correo válido.",
  password: "Usa una contraseña de al menos 6 caracteres.", name: "Introduce un nombre para mostrar.", birthDate: "Introduce una fecha de nacimiento válida.",
  signIn: "Vuelve a iniciar sesión para continuar.", image: "Elige una imagen compatible dentro del límite de tamaño.", optionalProfile: "Datos del perfil (opcionales)",
  optionalCopy: "Puedes añadir o cambiar estos datos en Configuración más adelante.", syncFailed: "No se pudo guardar el progreso en tu cuenta. Reinténtalo antes de salir.",
  loadFailed: "No se pudo cargar el progreso guardado. Inténtalo de nuevo.", retry: "Reintentar", saving: "Guardando…",
};
export const WORKFLOW_COPY: Record<LanguageCode, Copy> = { en, "zh-CN": zhCN, "zh-TW": zhTW, yue, es };
