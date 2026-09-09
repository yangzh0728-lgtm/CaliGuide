import type { LanguageCode } from "./translations";

export const PUBLIC_ACCESS_COPY: Record<LanguageCode, { title: string; description: string; guide: string; agency: string; login: string }> = {
  en: { title: "Start with a free preview", description: "Read one sample guide and explore one agency. Sign in to access the full libraries, forum, and CaliBot.", guide: "Read sample guide", agency: "Explore sample agency", login: "Sign in to access the full guide and agency libraries, forum posts and replies, and CaliBot." },
  "zh-CN": { title: "先看看免费示例", description: "阅读一篇示例指南，了解一个机构。登录后可查看完整指南和机构目录、论坛及 CaliBot。", guide: "阅读示例指南", agency: "查看示例机构", login: "登录后可查看完整指南和机构目录、论坛帖子与回复，并使用 CaliBot。" },
  "zh-TW": { title: "先看看免費範例", description: "閱讀一篇範例指南，了解一個機構。登入後可查看完整指南和機構目錄、論壇及 CaliBot。", guide: "閱讀範例指南", agency: "查看範例機構", login: "登入後可查看完整指南和機構目錄、論壇貼文與回覆，並使用 CaliBot。" },
  yue: { title: "先睇免費示例", description: "睇一篇示例指南，了解一個機構。登入後就可以睇完整指南同機構目錄、論壇，同埋用 CaliBot。", guide: "睇示例指南", agency: "睇示例機構", login: "登入後就可以睇完整指南同機構目錄、論壇帖文同回覆，同埋用 CaliBot。" },
  es: { title: "Empieza con una muestra gratuita", description: "Lee una guía y explora una agencia de muestra. Inicia sesión para acceder a las bibliotecas completas, el foro y CaliBot.", guide: "Leer guía de muestra", agency: "Explorar agencia de muestra", login: "Inicia sesión para acceder a las bibliotecas completas de guías y agencias, las publicaciones y respuestas del foro, y CaliBot." },
};
