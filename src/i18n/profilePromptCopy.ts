import type { LanguageCode } from "./translations";

type PromptCopy = {
  nameTitle: string; nameBody: string; nameLabel: string;
  arrivalTitle: string; arrivalBody: string; arrivalLabel: string;
  choose: string; skip: string; close: string; save: string; saving: string;
  personalize: string; genericTitle: string; genericBody: string;
  dismissSuggestion: string;
};

export const PROFILE_PROMPT_COPY: Record<LanguageCode, PromptCopy> = {
  en: {
    dismissSuggestion: "Dismiss this suggestion permanently",
    nameTitle: "What should people call you?", nameBody: "This name appears publicly on your forum posts. A nickname is fine. You can skip and post as CaliGuide Member.", nameLabel: "Display name",
    arrivalTitle: "Where are you in your move?", arrivalBody: "Choose a stage to tailor your suggested guide. This is optional and is not your immigration status.", arrivalLabel: "Arrival stage",
    choose: "Choose a stage", skip: "Skip for now", close: "Close", save: "Save and continue", saving: "Saving...",
    personalize: "Personalize suggestions", genericTitle: "Your next steps in California", genericBody: "Start with the First 30 Days guide, or choose your stage for a more relevant suggestion.",
  },
  "zh-CN": {
    dismissSuggestion: "永久关闭此推荐",
    nameTitle: "希望大家怎么称呼你？", nameBody: "这个名字会公开显示在你的论坛帖子中，可以使用昵称。你也可以跳过，以 CaliGuide Member 的名字发帖。", nameLabel: "显示名称",
    arrivalTitle: "你目前处于搬家的哪个阶段？", arrivalBody: "选择一个阶段，帮助我们推荐更合适的指南。此项为选填，不是询问你的移民身份。", arrivalLabel: "抵达阶段",
    choose: "选择阶段", skip: "暂时跳过", close: "关闭", save: "保存并继续", saving: "正在保存…",
    personalize: "个性化推荐", genericTitle: "在加州的下一步", genericBody: "从抵达加州后的前 30 天指南开始，或选择你的阶段以获取更合适的推荐。",
  },
  "zh-TW": {
    dismissSuggestion: "永久關閉此推薦",
    nameTitle: "希望大家怎麼稱呼你？", nameBody: "這個名字會公開顯示在你的論壇貼文中，可以使用暱稱。你也可以略過，以 CaliGuide Member 的名字發文。", nameLabel: "顯示名稱",
    arrivalTitle: "你目前處於搬家的哪個階段？", arrivalBody: "選擇一個階段，幫助我們推薦更合適的指南。此項為選填，不是詢問你的移民身分。", arrivalLabel: "抵達階段",
    choose: "選擇階段", skip: "暫時略過", close: "關閉", save: "儲存並繼續", saving: "正在儲存…",
    personalize: "個人化推薦", genericTitle: "在加州的下一步", genericBody: "從抵達加州後的前 30 天指南開始，或選擇你的階段以取得更合適的推薦。",
  },
  yue: {
    dismissSuggestion: "永久關閉呢個推薦",
    nameTitle: "想大家點稱呼你？", nameBody: "呢個名會公開顯示喺你嘅論壇帖文，可以用暱稱。你亦可以略過，用 CaliGuide Member 呢個名出帖。", nameLabel: "顯示名稱",
    arrivalTitle: "你而家搬到邊個階段？", arrivalBody: "揀個階段，等我哋推薦更啱你嘅指南。呢項可以唔填，唔係問你嘅移民身份。", arrivalLabel: "抵達階段",
    choose: "揀個階段", skip: "暫時略過", close: "關閉", save: "儲存並繼續", saving: "儲存緊…",
    personalize: "個人化推薦", genericTitle: "喺加州嘅下一步", genericBody: "由抵達加州頭 30 日指南開始，或者揀你嘅階段，睇更啱你嘅推薦。",
  },
  es: {
    dismissSuggestion: "Ocultar esta sugerencia permanentemente",
    nameTitle: "¿Cómo quieres que te llamen?", nameBody: "Este nombre aparece públicamente en tus publicaciones del foro. Puedes usar un apodo u omitir este paso y publicar como CaliGuide Member.", nameLabel: "Nombre público",
    arrivalTitle: "¿En qué etapa de la mudanza estás?", arrivalBody: "Elige una etapa para recibir una guía más relevante. Es opcional y no se refiere a tu situación migratoria.", arrivalLabel: "Etapa de llegada",
    choose: "Elige una etapa", skip: "Omitir por ahora", close: "Cerrar", save: "Guardar y continuar", saving: "Guardando...",
    personalize: "Personalizar sugerencias", genericTitle: "Tus próximos pasos en California", genericBody: "Empieza con la guía de los primeros 30 días o elige tu etapa para ver una sugerencia más relevante.",
  },
};
