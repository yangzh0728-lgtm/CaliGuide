import type { LanguageCode } from "../i18n/translations";
import {
  CONFUSION_TRANSLATIONS,
  INSTITUTION_TRANSLATIONS,
  type InstitutionTranslationSeed,
} from "./institutionTranslations";

export type InstitutionGroupId =
  | "immigration-status"
  | "identity-transportation"
  | "money-tax"
  | "work"
  | "health"
  | "housing-consumer"
  | "education"
  | "emergency-local";

export type InstitutionJurisdiction = "federal" | "california" | "regional" | "community";

export const INSTITUTION_GROUPS: ReadonlyArray<{
  id: InstitutionGroupId;
  labelKey: string;
}> = [
  { id: "immigration-status", labelKey: "agencies.group.immigrationStatus" },
  { id: "identity-transportation", labelKey: "agencies.group.identityTransportation" },
  { id: "money-tax", labelKey: "agencies.group.moneyTax" },
  { id: "work", labelKey: "agencies.group.work" },
  { id: "health", labelKey: "agencies.group.health" },
  { id: "housing-consumer", labelKey: "agencies.group.housingConsumer" },
  { id: "education", labelKey: "agencies.group.education" },
  { id: "emergency-local", labelKey: "agencies.group.emergencyLocal" },
] as const;

export interface Institution {
  id: string;
  name: string;
  shortName: string;
  officialName: string;
  acronym: string;
  publisherNames: string[];
  groupId: InstitutionGroupId;
  jurisdiction: InstitutionJurisdiction;
  priority: number;
  lastReviewedAt: string;
  purpose: string;
  doesNotDo: string;
  officialUrl: string;
  officialDomain: string;
  scamNote?: string;
  content: Record<LanguageCode, InstitutionContent>;
  confusionPairs: InstitutionConfusionPair[];
}

export interface InstitutionContent {
  purpose: string;
  doesNotDo: string;
  languageAccessNote: string;
  searchTerms: string[];
  scamWarning?: string;
}

export interface InstitutionConfusionPair {
  targetInstitutionId: string;
  content: Record<LanguageCode, { trigger: string; explanation: string }>;
}

const REVIEWED_AT = "2026-09-01";
const groupPriorities = new Map<InstitutionGroupId, number>();

const LANGUAGE_ACCESS_NOTES: Record<LanguageCode, string> = {
  en: "Check the official website for translated pages and ask the agency what free language assistance is available before your appointment.",
  "zh-CN": "请查看官方网站上的翻译页面，并在预约前向该机构询问可提供哪些免费的语言协助。",
  yue: "請查看官方網站嘅翻譯頁面，並喺預約前向該機構查詢可以提供邊啲免費語言協助。",
  "zh-TW": "請查看官方網站上的翻譯頁面，並在預約前向該機構詢問可提供哪些免費語言協助。",
  es: "Consulte el sitio web oficial para encontrar páginas traducidas y pregunte qué asistencia lingüística gratuita está disponible antes de su cita.",
};

type LocalizedContentOverrides = Partial<
  Record<LanguageCode, Partial<Omit<InstitutionContent, "scamWarning">>>
>;

const TRADITIONAL_REPLACEMENTS: Array<[RegExp, string]> = [
  [/处理/g, "處理"], [/申请/g, "申請"], [/许/g, "許"], [/签/g, "簽"], [/发/g, "發"],
  [/驻/g, "駐"], [/领/g, "領"], [/馆/g, "館"], [/证/g, "證"], [/决/g, "決"],
  [/个/g, "個"], [/务/g, "務"], [/录/g, "錄"], [/边/g, "邊"], [/检/g, "檢"],
  [/查/g, "查"], [/电/g, "電"], [/认/g, "認"], [/关/g, "關"], [/过/g, "過"],
  [/组织/g, "組織"], [/获/g, "獲"], [/讼/g, "訟"], [/律师/g, "律師"], [/员/g, "員"],
  [/顾问/g, "顧問"], [/资/g, "資"], [/格/g, "格"], [/驾驶/g, "駕駛"], [/车辆/g, "車輛"],
  [/登记/g, "登記"], [/产权/g, "產權"], [/考试/g, "考試"], [/号码/g, "號碼"], [/社会/g, "社會"],
  [/批准/g, "核准"], [/项目/g, "計畫"], [/补/g, "補"], [/更正/g, "更正"], [/税/g, "稅"],
  [/联邦/g, "聯邦"], [/身份/g, "身分"], [/邮/g, "郵"], [/转寄/g, "轉寄"], [/不会/g, "不會"],
  [/银行/g, "銀行"], [/保险/g, "保險"], [/机构/g, "機構"], [/费/g, "費"], [/执/g, "執"],
  [/报/g, "報"], [/给/g, "給"], [/钱/g, "錢"], [/诈/g, "詐"], [/盗/g, "盜"],
  [/监/g, "監"], [/专业/g, "專業"], [/选择/g, "選擇"], [/带薪/g, "帶薪"], [/劳/g, "勞"],
  [/场/g, "場"], [/赔/g, "賠"], [/学徒/g, "學徒"], [/纠纷/g, "糾紛"], [/医疗/g, "醫療"],
  [/经济/g, "經濟"], [/领袖/g, "領袖"], [/卫生/g, "衛生"], [/协调/g, "協調"], [/质量/g, "品質"],
  [/烟/g, "煙"], [/规则/g, "規則"], [/房地产/g, "房地產"], [/实/g, "實"], [/诉/g, "訴"],
  [/法院/g, "法院"], [/表格/g, "表格"], [/钱/g, "錢"], [/学校/g, "學校"], [/数据/g, "資料"],
  [/应急/g, "緊急"], [/响应/g, "應變"], [/复/g, "復"], [/警报/g, "警報"], [/县/g, "縣"],
  [/护/g, "護"], [/山火/g, "野火"], [/间/g, "間"], [/与/g, "與"], [/为/g, "為"],
  [/这/g, "這"], [/后/g, "後"], [/会/g, "會"], [/应/g, "應"], [/从/g, "從"],
  [/无/g, "無"], [/万/g, "萬"], [/网/g, "網"], [/门/g, "門"], [/书/g, "書"],
  [/开/g, "開"], [/对/g, "對"], [/买/g, "買"], [/卖/g, "賣"], [/级/g, "級"],
  [/东/g, "東"], [/湾/g, "灣"], [/区/g, "區"], [/旧/g, "舊"], [/车/g, "車"],
  [/内/g, "內"], [/台/g, "臺"], [/别/g, "別"], [/经/g, "經"], [/达/g, "達"],
  [/类/g, "類"], [/线/g, "線"], [/体/g, "體"], [/项/g, "項"], [/总/g, "總"],
];

export function toTraditionalInstitutionText(value: string) {
  return TRADITIONAL_REPLACEMENTS.reduce(
    (text, [pattern, replacement]) => text.replace(pattern, replacement),
    value,
  );
}

function institution(
  entry: Omit<
    Institution,
    | "officialDomain"
    | "officialName"
    | "acronym"
    | "priority"
    | "lastReviewedAt"
    | "content"
    | "confusionPairs"
  > & {
    localized?: LocalizedContentOverrides;
    confusionPairs?: InstitutionConfusionPair[];
  },
): Institution {
  const { localized = {}, confusionPairs = [], ...baseEntry } = entry;
  const translations = INSTITUTION_TRANSLATIONS[baseEntry.id];
  if (!translations) {
    throw new Error(`Missing institution translations for ${baseEntry.id}`);
  }
  const officialDomain = new URL(baseEntry.officialUrl).hostname;
  const priority = (groupPriorities.get(baseEntry.groupId) ?? 0) + 1;
  groupPriorities.set(baseEntry.groupId, priority);
  const simplifiedContent = {
    ...translations["zh-CN"],
    ...localized["zh-CN"],
  };
  const traditionalContent = {
    purpose: toTraditionalInstitutionText(simplifiedContent.purpose),
    doesNotDo: toTraditionalInstitutionText(simplifiedContent.doesNotDo),
    scamWarning: simplifiedContent.scamWarning
      ? toTraditionalInstitutionText(simplifiedContent.scamWarning)
      : undefined,
    searchTerms: simplifiedContent.searchTerms?.map(toTraditionalInstitutionText) ?? [],
  };
  const localizedSeeds: Record<LanguageCode, InstitutionTranslationSeed & { searchTerms?: string[] }> = {
    en: {
      purpose: baseEntry.purpose,
      doesNotDo: baseEntry.doesNotDo,
      scamWarning: baseEntry.scamNote,
      searchTerms: localized.en?.searchTerms ?? [],
    },
    "zh-CN": simplifiedContent,
    "zh-TW": { ...traditionalContent, ...localized["zh-TW"] },
    yue: { ...traditionalContent, ...localized.yue },
    es: { ...translations.es, ...localized.es },
  };
  const content = Object.fromEntries(
    (["en", "zh-CN", "yue", "zh-TW", "es"] as LanguageCode[]).map((language) => {
      const contentSeed = localizedSeeds[language];
      return [language, {
        purpose: contentSeed.purpose,
        doesNotDo: contentSeed.doesNotDo,
        languageAccessNote:
          localized[language]?.languageAccessNote ?? LANGUAGE_ACCESS_NOTES[language],
        searchTerms: contentSeed.searchTerms ?? [],
        ...(contentSeed.scamWarning ? { scamWarning: contentSeed.scamWarning } : {}),
      }];
    }),
  ) as Record<LanguageCode, InstitutionContent>;
  const localizedConfusionPairs = confusionPairs.map((pair) => {
    const pairTranslations = CONFUSION_TRANSLATIONS[`${baseEntry.id}:${pair.targetInstitutionId}`];
    if (!pairTranslations) {
      throw new Error(
        `Missing confusion-pair translations for ${baseEntry.id}:${pair.targetInstitutionId}`,
      );
    }
    const traditionalPair = {
      trigger: toTraditionalInstitutionText(pairTranslations["zh-CN"].trigger),
      explanation: toTraditionalInstitutionText(pairTranslations["zh-CN"].explanation),
    };
    return {
      ...pair,
      content: {
        en: pair.content.en,
        "zh-CN": pairTranslations["zh-CN"],
        "zh-TW": traditionalPair,
        yue: traditionalPair,
        es: pairTranslations.es,
      },
    };
  });

  return {
    ...baseEntry,
    officialName: baseEntry.name,
    acronym: baseEntry.shortName,
    officialDomain,
    priority,
    lastReviewedAt: REVIEWED_AT,
    content,
    confusionPairs: localizedConfusionPairs,
  };
}

function confusionPair(
  targetInstitutionId: string,
  trigger: string,
  explanation: string,
): InstitutionConfusionPair {
  const content = Object.fromEntries(
    (["en", "zh-CN", "yue", "zh-TW", "es"] as LanguageCode[]).map((language) => [
      language,
      { trigger, explanation },
    ]),
  ) as InstitutionConfusionPair["content"];
  return { targetInstitutionId, content };
}

export const INSTITUTION_CATALOG: readonly Institution[] = [
  institution({
    id: "uscis",
    name: "U.S. Citizenship and Immigration Services",
    shortName: "USCIS",
    publisherNames: ["U.S. Citizenship and Immigration Services"],
    groupId: "immigration-status",
    jurisdiction: "federal",
    purpose: "Processes many immigration benefit requests, including applications for status, work authorization, permanent residence, and naturalization.",
    doesNotDo: "It does not issue visas at U.S. embassies abroad, decide immigration-court cases, or provide personal legal representation.",
    officialUrl: "https://www.uscis.gov/",
    confusionPairs: [
      confusionPair(
        "cbp",
        "At a port of entry or looking for an I-94?",
        "CBP handles border inspections, ports of entry, and admission records such as the I-94.",
      ),
      confusionPair(
        "us-doj",
        "Need an immigration court or accredited representative?",
        "The Department of Justice operates immigration courts and recognizes accredited representatives; USCIS does not provide personal legal representation.",
      ),
    ],
  }),
  institution({
    id: "cbp",
    name: "U.S. Customs and Border Protection",
    shortName: "CBP",
    publisherNames: ["U.S. Customs and Border Protection"],
    groupId: "immigration-status",
    jurisdiction: "federal",
    purpose: "Manages U.S. ports of entry, border inspections, admission records, and traveler tools such as the electronic I-94 system.",
    doesNotDo: "It does not decide most immigration-benefit applications filed with USCIS or represent travelers in immigration matters.",
    officialUrl: "https://www.cbp.gov/",
    confusionPairs: [
      confusionPair(
        "uscis",
        "Applying for status, work authorization, or citizenship?",
        "USCIS handles most immigration-benefit applications after entry; CBP manages border inspection and admission records.",
      ),
    ],
  }),
  institution({
    id: "us-doj",
    name: "U.S. Department of Justice",
    shortName: "DOJ",
    publisherNames: ["U.S. Department of Justice"],
    groupId: "immigration-status",
    jurisdiction: "federal",
    purpose: "Through EOIR, operates immigration courts and the appeals system and recognizes organizations and accredited immigration representatives.",
    doesNotDo: "It does not file a person's immigration application or provide them a government lawyer; notarios cannot represent people before EOIR.",
    officialUrl: "https://www.justice.gov/eoir",
    scamNote: "Confirm attorneys and accredited representatives through official justice.gov resources. A notary or immigration consultant is not automatically authorized to give legal advice.",
  }),
  institution({
    id: "ca-dmv",
    name: "California Department of Motor Vehicles",
    shortName: "DMV",
    publisherNames: ["California Department of Motor Vehicles"],
    groupId: "identity-transportation",
    jurisdiction: "california",
    purpose: "Issues California driver licenses and identification cards and administers vehicle registration, title, testing, and related records.",
    doesNotDo: "It does not issue Social Security numbers, grant immigration status, or authorize employment in the United States.",
    officialUrl: "https://www.dmv.ca.gov/portal/",
    localized: {
      "zh-CN": {
        searchTerms: ["驾照", "身份证", "车辆登记"],
      },
      yue: {
        searchTerms: ["車牌", "身份證", "車輛登記"],
      },
      "zh-TW": {
        searchTerms: ["駕照", "身分證", "車輛登記"],
      },
      es: {
        searchTerms: ["licencia", "identificación", "registro del vehículo"],
      },
    },
    confusionPairs: [
      confusionPair(
        "ssa",
        "Need a Social Security number or card?",
        "SSA issues Social Security numbers and cards. DMV issues California driver licenses and identification cards.",
      ),
    ],
  }),
  institution({
    id: "ssa",
    name: "Social Security Administration",
    shortName: "SSA",
    publisherNames: ["Social Security Administration"],
    groupId: "identity-transportation",
    jurisdiction: "federal",
    purpose: "Administers Social Security programs and issues Social Security numbers and replacement or corrected Social Security cards.",
    doesNotDo: "It does not grant immigration status, issue work authorization, collect federal income tax, or issue California identification cards.",
    officialUrl: "https://www.ssa.gov/",
    confusionPairs: [
      confusionPair(
        "uscis",
        "Need work authorization or immigration status?",
        "USCIS handles work authorization and immigration-benefit requests. SSA issues Social Security numbers and cards.",
      ),
      confusionPair(
        "ca-dmv",
        "Need a California ID card or driver license?",
        "DMV issues California identity and driving documents. SSA does not issue state identification cards.",
      ),
    ],
  }),
  institution({
    id: "usps",
    name: "United States Postal Service",
    shortName: "USPS",
    publisherNames: ["United States Postal Service"],
    groupId: "housing-consumer",
    jurisdiction: "federal",
    purpose: "Delivers U.S. mail and provides official change-of-address and mail-forwarding services when people move.",
    doesNotDo: "A USPS forwarding order does not update USCIS, DMV, banks, insurers, or other organizations, and some government mail may not be forwarded.",
    officialUrl: "https://www.usps.com/manage/forward.htm",
    scamNote: "Use USPS.com or a Post Office for change-of-address service. Unaffiliated websites may charge much higher fees and cannot update other agencies for you.",
    localized: {
      en: {
        searchTerms: ["mail forwarding", "moving", "change of address"],
      },
      "zh-CN": {
        searchTerms: ["邮件转寄", "搬家", "改地址"],
      },
      yue: {
        searchTerms: ["郵件轉寄", "搬屋", "改地址"],
      },
      "zh-TW": {
        searchTerms: ["郵件轉寄", "搬家", "改地址"],
      },
      es: {
        searchTerms: ["reenvío de correo", "mudanza", "cambio de domicilio"],
      },
    },
    confusionPairs: [
      confusionPair(
        "uscis",
        "Need to update an immigration record?",
        "USCIS requires its own address update. USPS forwarding does not update USCIS and does not forward USCIS mail.",
      ),
      confusionPair(
        "ca-dmv",
        "Need to update a California license, ID, or vehicle?",
        "California DMV records require their own address update. USPS forwarding does not change DMV records.",
      ),
    ],
  }),
  institution({
    id: "irs",
    name: "Internal Revenue Service",
    shortName: "IRS",
    publisherNames: ["Internal Revenue Service"],
    groupId: "money-tax",
    jurisdiction: "federal",
    purpose: "Administers federal tax law, receives federal tax returns, and issues Individual Taxpayer Identification Numbers for federal tax purposes.",
    doesNotDo: "An ITIN does not provide immigration status, work authorization, Social Security benefits, or identification outside the federal tax system.",
    officialUrl: "https://www.irs.gov/",
    confusionPairs: [
      confusionPair(
        "ssa",
        "Need a Social Security number instead of a tax-only ITIN?",
        "SSA issues Social Security numbers to eligible people. The IRS issues ITINs only for federal tax purposes.",
      ),
    ],
  }),
  institution({
    id: "fdic",
    name: "Federal Deposit Insurance Corporation",
    shortName: "FDIC",
    publisherNames: ["Federal Deposit Insurance Corporation"],
    groupId: "money-tax",
    jurisdiction: "federal",
    purpose: "Insures eligible deposits at FDIC-insured banks and provides tools for checking a bank's insurance status and learning about bank accounts.",
    doesNotDo: "It does not insure investments such as stocks, bonds, mutual funds, crypto assets, or deposits held at institutions that are not FDIC insured.",
    officialUrl: "https://www.fdic.gov/",
  }),
  institution({
    id: "cfpb",
    name: "Consumer Financial Protection Bureau",
    shortName: "CFPB",
    publisherNames: ["Consumer Financial Protection Bureau"],
    groupId: "money-tax",
    jurisdiction: "federal",
    purpose: "Implements and enforces federal consumer financial law and accepts complaints about financial products and services.",
    doesNotDo: "It does not act as a person's private attorney, guarantee a complaint outcome, or insure bank deposits.",
    officialUrl: "https://www.consumerfinance.gov/",
  }),
  institution({
    id: "ftc",
    name: "Federal Trade Commission",
    shortName: "FTC",
    publisherNames: ["Federal Trade Commission"],
    groupId: "money-tax",
    jurisdiction: "federal",
    purpose: "Protects consumers from unfair or deceptive practices and operates federal reporting resources for fraud and identity theft.",
    doesNotDo: "It does not resolve every individual report, recover money on demand, or replace contacting local police during an immediate emergency.",
    officialUrl: "https://www.ftc.gov/",
  }),
  institution({
    id: "ca-insurance",
    name: "California Department of Insurance",
    shortName: "CDI",
    publisherNames: ["California Department of Insurance"],
    groupId: "money-tax",
    jurisdiction: "california",
    purpose: "Regulates insurance in California, licenses insurance professionals, provides consumer guidance, and accepts insurance-related complaints.",
    doesNotDo: "It does not sell insurance, choose a policy for a consumer, or replace emergency medical, police, or roadside services.",
    officialUrl: "https://www.insurance.ca.gov/",
  }),
  institution({
    id: "ca-edd",
    name: "California Employment Development Department",
    shortName: "EDD",
    publisherNames: ["California Employment Development Department"],
    groupId: "work",
    jurisdiction: "california",
    purpose: "Administers unemployment, disability, and Paid Family Leave programs and provides job, training, payroll-tax, and labor-market services.",
    doesNotDo: "It does not decide wage-theft claims, enforce meal-break rules, issue work authorization, or guarantee eligibility for benefits.",
    officialUrl: "https://edd.ca.gov/",
  }),
  institution({
    id: "ca-dir",
    name: "California Department of Industrial Relations",
    shortName: "DIR",
    publisherNames: ["California Department of Industrial Relations"],
    groupId: "work",
    jurisdiction: "california",
    purpose: "Oversees California workplace protections through programs covering labor standards, occupational safety, workers' compensation, and apprenticeships.",
    doesNotDo: "It does not find a job for an applicant, issue immigration documents, or replace emergency services for an immediate workplace danger.",
    officialUrl: "https://www.dir.ca.gov/",
  }),
  institution({
    id: "ca-labor-commissioner",
    name: "California Labor Commissioner's Office",
    shortName: "Labor Commissioner",
    publisherNames: ["California Labor Commissioner's Office"],
    groupId: "work",
    jurisdiction: "california",
    purpose: "Enforces many California labor standards and accepts wage claims and reports of retaliation and other labor-law violations.",
    doesNotDo: "It does not handle every employment dispute, provide private legal representation, or decide federal immigration status.",
    officialUrl: "https://www.dir.ca.gov/dlse/",
  }),
  institution({
    id: "covered-california",
    name: "Covered California",
    shortName: "Covered California",
    publisherNames: ["Covered California"],
    groupId: "health",
    jurisdiction: "california",
    purpose: "Operates California's health-insurance marketplace and screens applicants for financial help and possible Medi-Cal eligibility.",
    doesNotDo: "It does not provide medical care, replace a doctor or emergency room, or guarantee that every applicant qualifies for financial assistance.",
    officialUrl: "https://www.coveredca.com/",
  }),
  institution({
    id: "ca-public-health",
    name: "California Department of Public Health",
    shortName: "CDPH",
    publisherNames: ["California Department of Public Health"],
    groupId: "health",
    jurisdiction: "california",
    purpose: "Leads statewide public-health programs, health guidance, disease monitoring, licensing functions, and emergency public-health coordination.",
    doesNotDo: "It does not provide routine personal medical care, choose a health plan, or replace 911 for a life-threatening emergency.",
    officialUrl: "https://www.cdph.ca.gov/",
  }),
  institution({
    id: "epa",
    name: "U.S. Environmental Protection Agency",
    shortName: "EPA",
    publisherNames: ["U.S. Environmental Protection Agency"],
    groupId: "health",
    jurisdiction: "federal",
    purpose: "Protects human health and the environment and publishes national information and tools about air quality, smoke, pollution, and environmental rules.",
    doesNotDo: "It does not issue local evacuation orders, provide medical diagnosis, or replace local air districts and emergency authorities.",
    officialUrl: "https://www.epa.gov/",
  }),
  institution({
    id: "ca-real-estate",
    name: "California Department of Real Estate",
    shortName: "DRE",
    publisherNames: ["California Department of Real Estate"],
    groupId: "housing-consumer",
    jurisdiction: "california",
    purpose: "Licenses and regulates California real-estate professionals and provides public license lookup, education, enforcement, and consumer information.",
    doesNotDo: "It does not act as a tenant's lawyer, decide landlord-tenant court cases, or guarantee that a listing or transaction is legitimate.",
    officialUrl: "https://www.dre.ca.gov/",
  }),
  institution({
    id: "ca-doj",
    name: "California Department of Justice",
    shortName: "California DOJ",
    publisherNames: ["California Department of Justice"],
    groupId: "housing-consumer",
    jurisdiction: "california",
    purpose: "Enforces California law, protects consumers and civil rights, publishes public guidance, and provides reporting and lookup resources.",
    doesNotDo: "It does not provide private legal representation, decide a civil case, or replace 911 and local police during an emergency.",
    officialUrl: "https://oag.ca.gov/",
  }),
  institution({
    id: "ca-courts",
    name: "California Courts",
    shortName: "California Courts",
    publisherNames: ["California Courts"],
    groupId: "housing-consumer",
    jurisdiction: "california",
    purpose: "Provides court information, forms, filing guidance, and self-help resources for matters including housing, family, money, and civil cases.",
    doesNotDo: "Court self-help services provide legal information rather than legal advice and do not represent either side in a case.",
    officialUrl: "https://selfhelp.courts.ca.gov/",
  }),
  institution({
    id: "ca-education",
    name: "California Department of Education",
    shortName: "CDE",
    publisherNames: ["California Department of Education"],
    groupId: "education",
    jurisdiction: "california",
    purpose: "Oversees California's public-school system and publishes statewide guidance, program information, school data, and education resources.",
    doesNotDo: "It does not enroll an individual student or assign a neighborhood school; families usually work with their local school district.",
    officialUrl: "https://www.cde.ca.gov/",
  }),
  institution({
    id: "ca-oes",
    name: "California Governor's Office of Emergency Services",
    shortName: "Cal OES",
    publisherNames: ["California Governor's Office of Emergency Services"],
    groupId: "emergency-local",
    jurisdiction: "california",
    purpose: "Coordinates statewide emergency preparedness, response, recovery, alerts, and support among state, local, federal, and community partners.",
    doesNotDo: "It does not replace 911, local evacuation instructions, county emergency alerts, or first responders during an immediate emergency.",
    officialUrl: "https://www.caloes.ca.gov/",
  }),
  institution({
    id: "cal-fire",
    name: "California Department of Forestry and Fire Protection",
    shortName: "CAL FIRE",
    publisherNames: ["CAL FIRE"],
    groupId: "emergency-local",
    jurisdiction: "california",
    purpose: "Provides fire protection and prevention, wildfire information, incident resources, defensible-space guidance, and natural-resource stewardship.",
    doesNotDo: "It does not replace 911, local evacuation orders, or county alert systems during a fire or other immediate danger.",
    officialUrl: "https://www.fire.ca.gov/",
  }),
  institution({
    id: "ca-211",
    name: "211 California",
    shortName: "211",
    publisherNames: ["211 California"],
    groupId: "emergency-local",
    jurisdiction: "community",
    purpose: "Connects people with local food, housing, health, disaster, and other community services through 211 and an online resource directory.",
    doesNotDo: "It is not 911 and should not be used instead of emergency dispatch when someone faces immediate danger or a life-threatening condition.",
    officialUrl: "https://211ca.org/",
  }),
  institution({
    id: "bay-area-511",
    name: "Metropolitan Transportation Commission",
    shortName: "Bay Area 511",
    publisherNames: ["Metropolitan Transportation Commission"],
    groupId: "emergency-local",
    jurisdiction: "regional",
    purpose: "Operates the San Francisco Bay Area's 511 traveler-information service for transit, traffic, cycling, carpooling, and trip planning.",
    doesNotDo: "It does not operate every transit agency, set all fares, issue driver licenses, or provide statewide transportation information.",
    officialUrl: "https://511.org/",
  }),
  institution({
    id: "southern-california-511",
    name: "Southern California 511",
    shortName: "SoCal 511",
    publisherNames: ["Southern California 511"],
    groupId: "emergency-local",
    jurisdiction: "regional",
    purpose: "Provides Southern California traveler information, including traffic conditions, transit connections, road incidents, and regional trip tools.",
    doesNotDo: "It does not operate every local transit service, set all fares, issue licenses, or provide emergency dispatch.",
    officialUrl: "https://go511.com/",
  }),
  institution({
    id: "ca-state-services",
    name: "State of California",
    shortName: "CA.gov",
    publisherNames: ["State of California"],
    groupId: "emergency-local",
    jurisdiction: "california",
    purpose: "Provides the official statewide portal for finding California agencies, benefits, services, alerts, forms, and government information.",
    doesNotDo: "The portal does not itself decide every application or deliver every service; the responsible state or local agency handles the request.",
    officialUrl: "https://www.ca.gov/",
  }),
] as const;

const INSTITUTION_ID_BY_PUBLISHER = new Map(
  INSTITUTION_CATALOG.flatMap((entry) =>
    entry.publisherNames.map((publisherName) => [publisherName, entry.id] as const),
  ),
);

export function getInstitutionIdForPublisher(publisher: string) {
  const institutionId = INSTITUTION_ID_BY_PUBLISHER.get(publisher);
  if (!institutionId) {
    throw new Error(`No institution ID is configured for citation publisher: ${publisher}`);
  }
  return institutionId;
}
