import type { LanguageCode } from "../i18n/translations";

export const MOVING_CHECKLIST_STORAGE_KEY = "caliguide-moving-checklist";

export type MovingChecklistTaskId =
  | "usps"
  | "uscis"
  | "dmv-license"
  | "dmv-vehicle"
  | "voter"
  | "employer"
  | "financial"
  | "insurance"
  | "health"
  | "utilities";

export interface MovingChecklistTask {
  id: MovingChecklistTaskId;
  jurisdiction: "federal" | "california" | "provider";
  label: string;
  deadline: string;
  consequence: string;
}

interface MovingChecklistCopy {
  ariaLabel: string;
  heading: string;
  progress: string;
  reset: string;
  columns: { task: string; deadline: string; consequence: string };
  jurisdictions: Record<MovingChecklistTask["jurisdiction"], string>;
  tasks: MovingChecklistTask[];
}

const taskIds: MovingChecklistTaskId[] = [
  "usps",
  "uscis",
  "dmv-license",
  "dmv-vehicle",
  "voter",
  "employer",
  "financial",
  "insurance",
  "health",
  "utilities",
];

const copies: Record<LanguageCode, MovingChecklistCopy> = {
  en: {
    ariaLabel: "Moving address checklist",
    heading: "Address-change deadlines",
    progress: "completed",
    reset: "Reset checklist",
    columns: { task: "What to update", deadline: "When", consequence: "If you miss it" },
    jurisdictions: { federal: "Federal", california: "California", provider: "Provider" },
    tasks: [
      { id: "usps", jurisdiction: "federal", label: "USPS mail forwarding", deadline: "Before moving day", consequence: "Important mail may continue to the old address." },
      { id: "uscis", jurisdiction: "federal", label: "USCIS address", deadline: "Within 10 days for most noncitizens", consequence: "You may miss case notices and fail to meet a reporting duty." },
      { id: "dmv-license", jurisdiction: "california", label: "DMV driver license or ID", deadline: "Within 10 days", consequence: "Your identity record and DMV mail can remain out of date." },
      { id: "dmv-vehicle", jurisdiction: "california", label: "DMV vehicle or vessel record", deadline: "Within 10 days", consequence: "Registration and renewal notices may go to the old address." },
      { id: "voter", jurisdiction: "california", label: "California voter registration", deadline: "Before the next election deadline", consequence: "You may need conditional or provisional voting procedures." },
      { id: "employer", jurisdiction: "provider", label: "Employer and payroll", deadline: "Before the next payroll cycle", consequence: "Tax forms, benefits mail, or pay records may be delayed." },
      { id: "financial", jurisdiction: "provider", label: "Banks, cards, and lenders", deadline: "Within two weeks", consequence: "Cards, alerts, statements, or identity checks may fail." },
      { id: "insurance", jurisdiction: "provider", label: "Auto and renters insurance", deadline: "As soon as the move is certain", consequence: "Pricing and coverage records may use the wrong location." },
      { id: "health", jurisdiction: "provider", label: "Health plan and medical providers", deadline: "Within two weeks", consequence: "Cards, bills, network information, or notices may be delayed." },
      { id: "utilities", jurisdiction: "provider", label: "Utilities and communications", deadline: "Schedule before moving", consequence: "Service gaps or overlapping bills can result." },
    ],
  },
  "zh-CN": {
    ariaLabel: "搬家地址更新清单", heading: "地址更新期限", progress: "已完成", reset: "重置清单",
    columns: { task: "需要更新", deadline: "时间", consequence: "错过后可能发生" },
    jurisdictions: { federal: "联邦", california: "加州", provider: "服务商" },
    tasks: [
      { id: "usps", jurisdiction: "federal", label: "USPS 邮件转寄", deadline: "搬家日前", consequence: "重要邮件可能继续寄到旧地址。" },
      { id: "uscis", jurisdiction: "federal", label: "USCIS 地址", deadline: "多数非公民须在 10 天内", consequence: "可能错过案件通知并未履行申报义务。" },
      { id: "dmv-license", jurisdiction: "california", label: "DMV 驾照或身份证", deadline: "10 天内", consequence: "身份证件记录和 DMV 邮件可能仍使用旧地址。" },
      { id: "dmv-vehicle", jurisdiction: "california", label: "DMV 车辆或船只记录", deadline: "10 天内", consequence: "登记和续期通知可能寄到旧地址。" },
      { id: "voter", jurisdiction: "california", label: "加州选民登记", deadline: "下一次选举截止日前", consequence: "可能需要使用有条件或临时投票程序。" },
      { id: "employer", jurisdiction: "provider", label: "雇主和工资系统", deadline: "下一个发薪周期前", consequence: "税表、福利邮件或工资记录可能延误。" },
      { id: "financial", jurisdiction: "provider", label: "银行、信用卡和贷款机构", deadline: "两周内", consequence: "卡片、提醒、账单或身份核验可能失败。" },
      { id: "insurance", jurisdiction: "provider", label: "汽车和租客保险", deadline: "确定搬家后尽快", consequence: "定价和承保记录可能使用错误地点。" },
      { id: "health", jurisdiction: "provider", label: "医疗保险和医疗机构", deadline: "两周内", consequence: "保险卡、账单、网络信息或通知可能延误。" },
      { id: "utilities", jurisdiction: "provider", label: "水电燃气和通信服务", deadline: "搬家前安排", consequence: "可能出现断供或重复账单。" },
    ],
  },
  "zh-TW": {
    ariaLabel: "搬家地址更新清單", heading: "地址更新期限", progress: "已完成", reset: "重設清單",
    columns: { task: "需要更新", deadline: "時間", consequence: "錯過後可能發生" },
    jurisdictions: { federal: "聯邦", california: "加州", provider: "服務商" },
    tasks: [],
  },
  yue: {
    ariaLabel: "搬屋地址更新清單", heading: "地址更新期限", progress: "已完成", reset: "重設清單",
    columns: { task: "需要更新", deadline: "時間", consequence: "錯過後可能發生" },
    jurisdictions: { federal: "聯邦", california: "加州", provider: "服務商" },
    tasks: [],
  },
  es: {
    ariaLabel: "Lista de cambio de domicilio", heading: "Plazos para cambiar la dirección", progress: "completados", reset: "Reiniciar lista",
    columns: { task: "Qué actualizar", deadline: "Cuándo", consequence: "Si no lo haces" },
    jurisdictions: { federal: "Federal", california: "California", provider: "Proveedor" },
    tasks: [
      { id: "usps", jurisdiction: "federal", label: "Reenvío de correo de USPS", deadline: "Antes de mudarte", consequence: "El correo importante puede seguir llegando al domicilio anterior." },
      { id: "uscis", jurisdiction: "federal", label: "Dirección ante USCIS", deadline: "Dentro de 10 días para la mayoría de no ciudadanos", consequence: "Puedes perder avisos y no cumplir una obligación de reporte." },
      { id: "dmv-license", jurisdiction: "california", label: "Licencia o identificación del DMV", deadline: "Dentro de 10 días", consequence: "Tu registro de identidad y el correo del DMV pueden quedar desactualizados." },
      { id: "dmv-vehicle", jurisdiction: "california", label: "Registro de vehículo o embarcación del DMV", deadline: "Dentro de 10 días", consequence: "Los avisos de registro o renovación pueden llegar al domicilio anterior." },
      { id: "voter", jurisdiction: "california", label: "Registro electoral de California", deadline: "Antes del plazo de la próxima elección", consequence: "Quizá necesites procedimientos de voto condicional o provisional." },
      { id: "employer", jurisdiction: "provider", label: "Empleador y nómina", deadline: "Antes del siguiente ciclo de pago", consequence: "Los formularios fiscales, beneficios o registros de pago pueden demorarse." },
      { id: "financial", jurisdiction: "provider", label: "Bancos, tarjetas y prestamistas", deadline: "Dentro de dos semanas", consequence: "Pueden fallar tarjetas, alertas, estados de cuenta o verificaciones." },
      { id: "insurance", jurisdiction: "provider", label: "Seguro de auto e inquilino", deadline: "En cuanto la mudanza sea segura", consequence: "El precio y la cobertura pueden usar una ubicación incorrecta." },
      { id: "health", jurisdiction: "provider", label: "Plan de salud y proveedores médicos", deadline: "Dentro de dos semanas", consequence: "Pueden demorarse tarjetas, facturas, datos de red o avisos." },
      { id: "utilities", jurisdiction: "provider", label: "Servicios y comunicaciones", deadline: "Programar antes de mudarte", consequence: "Puede haber cortes o facturas superpuestas." },
    ],
  },
};

copies["zh-TW"].tasks = copies["zh-CN"].tasks.map((task) => ({
  ...task,
  label: task.label.replaceAll("证", "證").replaceAll("车", "車").replaceAll("邮", "郵").replaceAll("医", "醫"),
  deadline: task.deadline.replaceAll("内", "內").replaceAll("后", "後"),
  consequence: task.consequence.replaceAll("记录", "紀錄").replaceAll("邮", "郵").replaceAll("发", "發").replaceAll("内", "內"),
}));
copies.yue.tasks = copies["zh-TW"].tasks;

export function getMovingChecklistCopy(language: LanguageCode) {
  return copies[language];
}

export function parseMovingChecklistProgress(raw: string | null): MovingChecklistTaskId[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is MovingChecklistTaskId =>
      typeof value === "string" && taskIds.includes(value as MovingChecklistTaskId),
    );
  } catch {
    return [];
  }
}
