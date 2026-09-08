import type { LanguageCode } from "./translations";

type Copy = { required: string; optional: string; description: string; title: string; reminder: string; later: string; never: string; save: string; choose: string; back: string };
export const OPTIONAL_PROFILE_COPY: Record<LanguageCode, Copy> = {
  en: {
    required: "Required account information", optional: "Optional profile information",
    description: "You can leave every field below blank. Your display name is public on forum posts; your arrival stage personalizes suggestions. Other details are optional profile information, not needed to use CaliGuide.",
    title: "Add optional profile details?", reminder: "Only unanswered fields appear here. Share as much or as little as you like. Not now pauses this reminder for 30 days; you can always edit your details in Settings.",
    later: "Not now", never: "Don't ask again", save: "Save", choose: "Leave blank", back: "Back to sign-up options",
  },
  "zh-CN": {
    required: "必填账户信息", optional: "选填个人资料",
    description: "以下项目都可以留空。显示名称会公开显示在论坛帖子中；抵达阶段用于个性化推荐。其他资料为选填，使用 CaliGuide 不需要填写。",
    title: "要补充选填资料吗？", reminder: "这里只显示尚未填写的项目，你可以自行决定填写多少。选择“暂时不用”会暂停提醒 30 天，你随时可以在设置中修改资料。",
    later: "暂时不用", never: "不再提醒", save: "保存", choose: "留空", back: "返回注册方式",
  },
  "zh-TW": {
    required: "必填帳戶資訊", optional: "選填個人資料",
    description: "以下項目都可以留空。顯示名稱會公開顯示在論壇貼文中；抵達階段用於個人化推薦。其他資料為選填，使用 CaliGuide 不需要填寫。",
    title: "要補充選填資料嗎？", reminder: "這裡只顯示尚未填寫的項目，你可以自行決定填寫多少。選擇「暫時不用」會暫停提醒 30 天，你隨時可以在設定中修改資料。",
    later: "暫時不用", never: "不再提醒", save: "儲存", choose: "留空", back: "返回註冊方式",
  },
  yue: {
    required: "必填帳戶資料", optional: "選填個人資料",
    description: "以下項目全部都可以唔填。顯示名稱會公開顯示喺論壇帖文；抵達階段會用嚟推薦適合你嘅指南。其他資料都係選填，唔填都可以用 CaliGuide。",
    title: "想補充選填資料嗎？", reminder: "呢度只會顯示未填嘅項目，填幾多由你決定。揀「暫時唔使」會暫停提醒 30 日，你隨時都可以喺設定改資料。",
    later: "暫時唔使", never: "唔好再提醒", save: "儲存", choose: "留空", back: "返回註冊方式",
  },
  es: {
    required: "Información obligatoria de la cuenta", optional: "Información opcional del perfil",
    description: "Puedes dejar todos los campos siguientes en blanco. Tu nombre público aparece en el foro; tu etapa de llegada personaliza las sugerencias. Los demás datos son opcionales y no son necesarios para usar CaliGuide.",
    title: "¿Quieres añadir datos opcionales?", reminder: "Solo aparecen los campos sin completar. Comparte lo que quieras. Ahora no pausa este recordatorio durante 30 días; siempre puedes editar tus datos en Configuración.",
    later: "Ahora no", never: "No volver a preguntar", save: "Guardar", choose: "Dejar en blanco", back: "Volver a las opciones de registro",
  },
};
