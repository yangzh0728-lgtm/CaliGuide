import { LanguageCode } from "../i18n/translations";

export const LEGAL_PAGE_IDS = ["privacy", "terms", "cookies", "disclaimer"] as const;

export type LegalPageId = (typeof LEGAL_PAGE_IDS)[number];

export interface LegalSection {
  heading: string;
  paragraphs: string[];
  items?: string[];
}

export interface LegalDocument {
  title: string;
  summary: string;
  effectiveDate: string;
  sections: LegalSection[];
}

type LegalDocumentsById = Record<LegalPageId, LegalDocument>;

const EFFECTIVE_DATE = "2026-08-26";

const legalDocuments: Record<LanguageCode, LegalDocumentsById> = {
  en: {
    privacy: {
      title: "Privacy Policy",
      summary: "How CaliGuide collects, uses, stores, and shares information when you use the service.",
      effectiveDate: EFFECTIVE_DATE,
      sections: [
        {
          heading: "Information we collect",
          paragraphs: [
            "CaliGuide collects account and profile details such as your name, email, date of birth, sex selection, nationality, current location, and arrival status. It also processes forum posts, comments, votes, saved items, chatbot conversations, images you upload, and basic technical request data.",
            "Forum posts, comments, display names, and attached forum images are intended to be visible to other community members. Do not post passports, immigration documents, financial account numbers, medical records, or other sensitive documents in public forum areas.",
          ],
        },
        {
          heading: "How information is used",
          paragraphs: [
            "We use information to authenticate accounts, provide personalized guides and saved resources, operate forum and chatbot features, remember permitted preferences, protect the service, and troubleshoot errors.",
            "CaliGuide does not currently install advertising or product-analytics technology. If that changes, non-essential analytics and marketing storage will remain off until you choose to allow it.",
          ],
        },
        {
          heading: "Service providers and data transfers",
          paragraphs: [
            "Supabase provides authentication and database services. Cloudflare R2 stores uploaded media. Google OAuth can be used for sign-in. Baidu Qianfan processes chatbot prompts and attached chatbot images. Mem0 stores user-level chatbot memory. These providers may process data in locations outside your state or country under their own service terms.",
            "Only send the chatbot information you are comfortable having processed by the AI and memory providers. CaliGuide may send relevant conversation context and saved memory to answer later questions.",
          ],
        },
        {
          heading: "Your choices, retention, and contact",
          paragraphs: [
            "You can reject optional browser storage, change Privacy Choices, edit available profile fields, and delete forum content you created where the feature is available. Authentication storage remains necessary for sign-in and security.",
            "In Profile > Settings, you can download a copy of your account data or permanently delete your account. Account deletion removes user-owned Supabase records, uploaded Cloudflare R2 media, Mem0 chatbot memories, and the Supabase Auth identity. For access or correction help, contact privacy@caliguide.org. Retention depends on the feature, legal obligations, security needs, and provider configuration. California residents may have additional rights when applicable law covers the service.",
          ],
        },
      ],
    },
    terms: {
      title: "Terms of Use",
      summary: "Rules for using CaliGuide accounts, guides, community features, uploads, and AI tools.",
      effectiveDate: EFFECTIVE_DATE,
      sections: [
        {
          heading: "Using CaliGuide",
          paragraphs: [
            "You must provide accurate account information, protect your credentials, and use the service only for lawful purposes. You are responsible for activity under your account and should tell us if you believe it has been compromised.",
            "CaliGuide may change, suspend, or discontinue features as the service develops. Availability is not guaranteed, and third-party services may experience outages or change their terms.",
          ],
        },
        {
          heading: "Community content and uploads",
          paragraphs: [
            "You keep ownership of content you submit. You grant CaliGuide permission to host, reproduce, display, and process that content only as needed to operate and improve the service.",
            "Do not upload illegal, abusive, deceptive, infringing, unsafe, or privacy-violating content. Do not expose another person's personal documents or confidential information. CaliGuide may remove content or restrict accounts to protect users and the service.",
          ],
        },
        {
          heading: "Guides, translations, and AI",
          paragraphs: [
            "Guides, forum translations, and chatbot answers are provided for general information. Automated translation and AI output can be incomplete, outdated, or wrong. Always confirm important instructions with the cited official source or a qualified professional.",
            "Nothing on CaliGuide creates an attorney-client, doctor-patient, financial-adviser, or government-agency relationship.",
          ],
        },
        {
          heading: "Responsibility and contact",
          paragraphs: [
            "To the extent permitted by law, CaliGuide is provided as available without a promise that every result will be accurate, uninterrupted, or suitable for your situation. You remain responsible for decisions made using the service.",
            "Questions about these terms can be sent to privacy@caliguide.org. These terms should receive qualified legal review before a full public launch.",
          ],
        },
      ],
    },
    cookies: {
      title: "Cookie and Local Storage Notice",
      summary: "What CaliGuide stores in your browser and how to control optional storage.",
      effectiveDate: EFFECTIVE_DATE,
      sections: [
        {
          heading: "Necessary storage",
          paragraphs: [
            "Necessary storage keeps sign-in, security, password recovery, requested registration flows, and the selected interface language working. It cannot be switched off through Privacy Choices because those requested functions would not work reliably without it.",
          ],
          items: [
            "Supabase authentication storage: session and refresh-token state used to keep you signed in securely.",
            "caliguide-google-profile-draft: temporary profile details used to complete a Google OAuth registration.",
            "caliguide-privacy-consent: your consent version, category choices, and update time.",
            "caliguide-language: necessary functional storage that remembers the interface language you selected.",
          ],
        },
        {
          heading: "Preference storage",
          paragraphs: [
            "The optional preference storage is disabled until you allow it. Rejecting preferences removes the local chatbot cache from this browser.",
          ],
          items: [
            "caliguide-chat-memory: keeps a local chatbot cache for faster continuity on this device. Signed-in chat history may also be stored in Supabase as part of the account service.",
          ],
        },
        {
          heading: "Analytics and marketing",
          paragraphs: [
            "CaliGuide does not currently install product-analytics or advertising storage. The controls are included now so those categories remain disabled by default if services are introduced later.",
          ],
        },
        {
          heading: "Manage your choices",
          paragraphs: [
            "Use Privacy Choices in the site footer to accept, reject, or customize optional categories. You can also clear site data in your browser, but doing so may sign you out and reset preferences.",
            "Browser storage and similar device technologies can serve the same purposes as traditional cookies, so this notice covers both.",
          ],
        },
      ],
    },
    disclaimer: {
      title: "Content Disclaimer",
      summary: "Important limits on CaliGuide guides, community posts, translations, and chatbot responses.",
      effectiveDate: EFFECTIVE_DATE,
      sections: [
        {
          heading: "General information only",
          paragraphs: [
            "CaliGuide organizes general information for people settling in California. It is not a law firm, medical provider, financial adviser, tax preparer, government agency, or emergency service.",
            "Rules, fees, deadlines, eligibility, and agency procedures change. Check the date and citations on each guide and confirm the current requirement with the responsible official agency.",
          ],
        },
        {
          heading: "Community and translated content",
          paragraphs: [
            "Forum posts and comments reflect individual users' experiences and have not necessarily been verified by CaliGuide. Automated translations may change meaning or omit important context.",
          ],
        },
        {
          heading: "Chatbot and memory",
          paragraphs: [
            "The chatbot can generate incorrect or incomplete answers. Its memory is designed for continuity, not as an authoritative record of your identity, legal status, health, finances, or deadlines.",
            "Do not rely on a chatbot response as your only source for a high-impact decision. Review cited official sources and consult an appropriately licensed professional when needed.",
          ],
        },
        {
          heading: "Emergencies and urgent deadlines",
          paragraphs: [
            "Call 911 for an emergency. For urgent legal, immigration, medical, housing, or financial deadlines, contact the relevant agency or qualified professional directly rather than waiting for a CaliGuide response.",
          ],
        },
      ],
    },
  },
  "zh-CN": {
    privacy: {
      title: "隐私政策",
      summary: "说明你使用 CaliGuide 时，我们如何收集、使用、保存和共享信息。",
      effectiveDate: EFFECTIVE_DATE,
      sections: [
        { heading: "我们收集的信息", paragraphs: ["CaliGuide 会处理姓名、邮箱、出生日期、性别选择、国籍、当前所在地和到达状态，也会处理论坛内容、收藏、聊天记录、上传图片和基本技术请求数据。", "论坛帖子、评论、显示名称和论坛图片会向其他社区成员公开。请勿在公开论坛发布护照、移民文件、银行账号、病历或其他敏感文件。"] },
        { heading: "信息用途", paragraphs: ["我们使用这些信息来验证账户、提供个性化指南与收藏、运行论坛和聊天助手、记住你允许的偏好、保护服务并排查错误。", "CaliGuide 目前没有安装广告或产品分析技术。未来如有变更，分析和营销类存储仍会保持关闭，直到你主动允许。"] },
        { heading: "服务商和数据传输", paragraphs: ["Supabase 提供登录和数据库服务；Cloudflare R2 保存上传媒体；Google OAuth 可用于登录；Baidu Qianfan 处理聊天提示和图片；Mem0 保存用户级聊天记忆。服务商可能在你所在州或国家以外处理数据。", "请只向聊天助手发送你愿意交由 AI 和记忆服务商处理的信息。为了回答后续问题，CaliGuide 可能发送相关对话上下文和已保存记忆。"] },
        { heading: "你的选择、保留和联系", paragraphs: ["你可以拒绝可选浏览器存储、重新打开“隐私选择”、修改现有个人资料字段，并在功能可用时删除自己发布的论坛内容。用于登录和安全的存储属于必要存储。", "你可以在“个人资料 > 设置”中下载账户数据副本，或永久删除账户。删除账户会移除用户拥有的 Supabase 数据、Cloudflare R2 上传媒体、Mem0 聊天记忆和 Supabase Auth 身份。访问或更正帮助请联系 privacy@caliguide.org。保留期限取决于功能、法律义务、安全需要和服务商配置。"] },
      ],
    },
    terms: {
      title: "使用条款",
      summary: "使用 CaliGuide 账户、指南、社区功能、上传和 AI 工具时应遵守的规则。",
      effectiveDate: EFFECTIVE_DATE,
      sections: [
        { heading: "使用 CaliGuide", paragraphs: ["你应提供准确的账户信息、保护登录凭据，并仅将服务用于合法目的。你需要对账户下的活动负责。", "随着产品发展，CaliGuide 可能修改、暂停或停止部分功能。第三方服务也可能发生中断或改变条款。"] },
        { heading: "社区内容和上传", paragraphs: ["你保留提交内容的所有权，并授权 CaliGuide 为运行和改进服务而托管、复制、展示和处理这些内容。", "不得上传违法、骚扰、欺骗、侵权、不安全或侵犯隐私的内容，也不得公开他人的个人文件。CaliGuide 可为保护用户和服务而移除内容或限制账户。"] },
        { heading: "指南、翻译和 AI", paragraphs: ["指南、论坛翻译和聊天回答仅提供一般信息。自动翻译和 AI 输出可能不完整、过时或错误。重要事项请向引用的官方来源或合格专业人士确认。", "CaliGuide 不会因此与你建立律师、医生、财务顾问或政府机构关系。"] },
        { heading: "责任和联系", paragraphs: ["在法律允许范围内，CaliGuide 按现状提供，不保证每项结果都准确、不间断或适合你的情况。你仍需对使用服务作出的决定负责。", "条款问题请发送至 privacy@caliguide.org。正式公开发布前，这些条款应由合格法律专业人士审核。"] },
      ],
    },
    cookies: {
      title: "Cookie 与本地存储说明",
      summary: "说明 CaliGuide 在浏览器中保存什么，以及如何控制可选存储。",
      effectiveDate: EFFECTIVE_DATE,
      sections: [
        { heading: "必要存储", paragraphs: ["必要存储用于登录、安全、密码重置、你主动发起的注册流程和界面语言，因此无法通过“隐私选择”关闭。"], items: ["Supabase authentication：安全保存会话和刷新令牌状态。", "caliguide-google-profile-draft：临时保存完成 Google OAuth 注册所需的资料。", "caliguide-privacy-consent：保存同意版本、分类选择和更新时间。", "caliguide-language：作为必要功能存储，记住你选择的界面语言。"] },
        { heading: "偏好存储", paragraphs: ["在你允许前，可选偏好存储保持关闭。拒绝偏好后，浏览器会删除本地聊天缓存。"], items: ["caliguide-chat-memory：在本设备保存聊天缓存；登录后的聊天记录也可能作为账户服务保存在 Supabase。"] },
        { heading: "分析和营销", paragraphs: ["CaliGuide 目前没有安装产品分析或广告存储。现在提前提供控制，是为了未来引入服务时这些分类仍默认关闭。"] },
        { heading: "管理选择", paragraphs: ["你可以随时通过页脚的“隐私选择”接受、拒绝或自定义可选分类。清除浏览器站点数据可能会让你退出登录并重置偏好。", "本说明同时涵盖 Cookie、本地存储和具有类似作用的设备技术。"] },
      ],
    },
    disclaimer: {
      title: "内容免责声明",
      summary: "关于 CaliGuide 指南、社区帖子、翻译和聊天回答的重要限制。",
      effectiveDate: EFFECTIVE_DATE,
      sections: [
        { heading: "仅供一般信息", paragraphs: ["CaliGuide 为在加州安顿的人整理一般信息，不是律师事务所、医疗机构、财务顾问、报税机构、政府机关或紧急服务。", "规则、费用、期限、资格和政府流程会变化。请查看指南日期和引用，并向负责的官方机构确认最新要求。"] },
        { heading: "社区与翻译内容", paragraphs: ["论坛帖子和评论反映用户个人经验，不一定经过 CaliGuide 核实。自动翻译可能改变含义或遗漏重要语境。"] },
        { heading: "聊天助手与记忆", paragraphs: ["聊天助手可能生成错误或不完整的回答。记忆功能用于保持对话连续性，不是你的身份、法律状态、健康、财务或期限的权威记录。", "高影响决定不要只依赖聊天回答；请查看官方来源，并在需要时咨询持证专业人士。"] },
        { heading: "紧急情况与紧迫期限", paragraphs: ["紧急情况请拨打 911。遇到紧迫的法律、移民、医疗、住房或财务期限，请直接联系相关机构或合格专业人士。"] },
      ],
    },
  },
  yue: {} as LegalDocumentsById,
  "zh-TW": {} as LegalDocumentsById,
  es: {} as LegalDocumentsById,
};

legalDocuments["zh-TW"] = {
  privacy: {
    title: "隱私權政策",
    summary: "說明你使用 CaliGuide 時，我們如何收集、使用、保存與分享資料。",
    effectiveDate: EFFECTIVE_DATE,
    sections: [
      { heading: "我們收集的資訊", paragraphs: ["CaliGuide 會處理姓名、電子郵件、出生日期、性別選擇、國籍、目前所在地與抵達狀態，也會處理論壇內容、收藏、聊天記錄、上傳圖片及基本技術請求資料。", "論壇貼文、留言、顯示名稱與論壇圖片會向其他社群成員公開。請勿在公開論壇發布護照、移民文件、銀行帳號、病歷或其他敏感文件。"] },
      { heading: "資訊用途", paragraphs: ["我們使用這些資訊來驗證帳戶、提供個人化指南與收藏、執行論壇與聊天助理、記住你允許的偏好、保護服務並排查錯誤。", "CaliGuide 目前未安裝廣告或產品分析技術。未來如有變更，分析與行銷類儲存仍會保持關閉，直到你主動允許。"] },
      { heading: "服務供應商與資料傳輸", paragraphs: ["Supabase 提供登入與資料庫服務；Cloudflare R2 保存上傳媒體；Google OAuth 可用於登入；Baidu Qianfan 處理聊天提示與圖片；Mem0 保存使用者層級的聊天記憶。服務供應商可能在你所在州或國家以外處理資料。", "請只向聊天助理傳送你願意交由 AI 與記憶服務供應商處理的資訊。為回答後續問題，CaliGuide 可能傳送相關對話內容與已保存記憶。"] },
      { heading: "你的選擇、保留與聯絡", paragraphs: ["你可以拒絕選用的瀏覽器儲存、重新開啟「隱私權選擇」、修改現有個人資料欄位，並在功能可用時刪除自己發布的論壇內容。登入與安全所需的儲存屬於必要儲存。", "你可以在「個人資料 > 設定」下載帳戶資料副本，或永久刪除帳戶。刪除帳戶會移除使用者擁有的 Supabase 資料、Cloudflare R2 上傳媒體、Mem0 聊天記憶與 Supabase Auth 身分。存取或更正協助請寄至 privacy@caliguide.org。"] },
    ],
  },
  terms: {
    title: "使用條款",
    summary: "使用 CaliGuide 帳戶、指南、社群功能、上傳與 AI 工具時應遵守的規則。",
    effectiveDate: EFFECTIVE_DATE,
    sections: [
      { heading: "使用 CaliGuide", paragraphs: ["你應提供正確的帳戶資訊、保護登入憑證，並僅將服務用於合法目的。你必須對帳戶下的活動負責。", "隨著產品發展，CaliGuide 可能修改、暫停或停止部分功能。第三方服務也可能中斷或變更條款。"] },
      { heading: "社群內容與上傳", paragraphs: ["你保留所提交內容的所有權，並授權 CaliGuide 在執行與改善服務所需範圍內託管、複製、顯示與處理該內容。", "不得上傳違法、騷擾、欺騙、侵權、不安全或侵犯隱私的內容，也不得公開他人的個人文件。CaliGuide 可為保護使用者與服務而移除內容或限制帳戶。"] },
      { heading: "指南、翻譯與 AI", paragraphs: ["指南、論壇翻譯與聊天回答僅提供一般資訊。自動翻譯與 AI 輸出可能不完整、過時或錯誤。重要事項請向引用的官方來源或合格專業人士確認。", "CaliGuide 不會因此與你建立律師、醫師、財務顧問或政府機關關係。"] },
      { heading: "責任與聯絡", paragraphs: ["在法律允許範圍內，CaliGuide 按現況提供，不保證每項結果都正確、不中斷或適合你的情況。你仍須對使用服務所作的決定負責。", "條款問題請寄至 privacy@caliguide.org。正式公開發布前，這些條款應由合格法律專業人士審閱。"] },
    ],
  },
  cookies: {
    title: "Cookie 與本機儲存通知",
    summary: "說明 CaliGuide 在瀏覽器中儲存什麼，以及如何控制選用儲存。",
    effectiveDate: EFFECTIVE_DATE,
    sections: [
      { heading: "必要儲存", paragraphs: ["必要儲存用於登入、安全、密碼重設、你主動發起的註冊流程與介面語言，因此無法透過「隱私權選擇」關閉。"], items: ["Supabase authentication：安全保存工作階段與更新權杖狀態。", "caliguide-google-profile-draft：暫時保存完成 Google OAuth 註冊所需的資料。", "caliguide-privacy-consent：保存同意版本、分類選擇與更新時間。", "caliguide-language：作為必要功能儲存，記住你選擇的介面語言。"] },
      { heading: "偏好儲存", paragraphs: ["在你允許前，選用偏好儲存保持關閉。拒絕偏好後，瀏覽器會刪除本機聊天快取。"], items: ["caliguide-chat-memory：在本裝置保存聊天快取；登入後的聊天記錄也可能作為帳戶服務保存在 Supabase。"] },
      { heading: "分析與行銷", paragraphs: ["CaliGuide 目前未安裝產品分析或廣告儲存。現在先提供控制，是為了未來引入服務時這些分類仍預設關閉。"] },
      { heading: "管理選擇", paragraphs: ["你可以隨時透過頁尾的「隱私權選擇」接受、拒絕或自訂選用分類。清除瀏覽器網站資料可能會登出並重設偏好。", "本通知同時涵蓋 Cookie、本機儲存與用途相近的裝置技術。"] },
    ],
  },
  disclaimer: {
    title: "內容免責聲明",
    summary: "關於 CaliGuide 指南、社群貼文、翻譯與聊天回答的重要限制。",
    effectiveDate: EFFECTIVE_DATE,
    sections: [
      { heading: "僅供一般資訊", paragraphs: ["CaliGuide 為在加州安頓的人整理一般資訊，不是律師事務所、醫療機構、財務顧問、報稅機構、政府機關或緊急服務。", "規則、費用、期限、資格與政府流程會變更。請查看指南日期與引用，並向負責的官方機關確認最新要求。"] },
      { heading: "社群與翻譯內容", paragraphs: ["論壇貼文與留言反映使用者個人經驗，不一定經過 CaliGuide 核實。自動翻譯可能改變含義或遺漏重要脈絡。"] },
      { heading: "聊天助理與記憶", paragraphs: ["聊天助理可能產生錯誤或不完整的回答。記憶功能用於保持對話連續性，不是你的身分、法律狀態、健康、財務或期限的權威記錄。", "高影響決定不要只依賴聊天回答；請查看官方來源，並在需要時諮詢持證專業人士。"] },
      { heading: "緊急情況與迫切期限", paragraphs: ["緊急情況請撥打 911。遇到迫切的法律、移民、醫療、住房或財務期限，請直接聯絡相關機關或合格專業人士。"] },
    ],
  },
};

legalDocuments.yue = {
  privacy: {
    title: "私隱政策",
    summary: "講解你使用 CaliGuide 時，我哋點樣收集、使用、保存同分享資料。",
    effectiveDate: EFFECTIVE_DATE,
    sections: [
      { heading: "我哋收集嘅資料", paragraphs: ["CaliGuide 會處理姓名、電郵、出生日期、性別選擇、國籍、目前所在地同抵達狀態，亦會處理論壇內容、收藏、聊天記錄、上載圖片同基本技術請求資料。", "論壇帖文、留言、顯示名稱同論壇圖片會畀其他社群成員睇到。請唔好喺公開論壇發布護照、移民文件、銀行帳號、病歷或其他敏感文件。"] },
      { heading: "資料用途", paragraphs: ["我哋用呢啲資料驗證帳戶、提供個人化指南同收藏、運作論壇同聊天助手、記住你允許嘅偏好、保護服務同排查錯誤。", "CaliGuide 目前冇安裝廣告或產品分析技術。將來如有改變，分析同市場推廣類儲存仍會保持關閉，直至你主動允許。"] },
      { heading: "服務供應商同資料傳輸", paragraphs: ["Supabase 提供登入同資料庫服務；Cloudflare R2 保存上載媒體；Google OAuth 可用作登入；Baidu Qianfan 處理聊天提示同圖片；Mem0 保存用戶層級嘅聊天記憶。服務供應商可能喺你所在州或國家以外處理資料。", "請只向聊天助手傳送你願意交畀 AI 同記憶服務供應商處理嘅資料。為咗回答之後嘅問題，CaliGuide 可能傳送相關對話內容同已保存記憶。"] },
      { heading: "你嘅選擇、保留同聯絡", paragraphs: ["你可以拒絕可選瀏覽器儲存、重新開啟「私隱選擇」、修改現有個人資料欄位，並喺功能可用時刪除自己發布嘅論壇內容。登入同安全所需嘅儲存屬於必要儲存。", "你可以喺「個人資料 > 設定」下載帳戶資料副本，或者永久刪除帳戶。刪除帳戶會移除用戶擁有嘅 Supabase 資料、Cloudflare R2 上載媒體、Mem0 聊天記憶同 Supabase Auth 身份。存取或更正協助請電郵 privacy@caliguide.org。"] },
    ],
  },
  terms: {
    title: "使用條款",
    summary: "使用 CaliGuide 帳戶、指南、社群功能、上載同 AI 工具時要遵守嘅規則。",
    effectiveDate: EFFECTIVE_DATE,
    sections: [
      { heading: "使用 CaliGuide", paragraphs: ["你應該提供正確嘅帳戶資料、保護登入憑證，並只將服務用於合法目的。你需要為帳戶內嘅活動負責。", "隨住產品發展，CaliGuide 可能修改、暫停或停止部分功能。第三方服務亦可能中斷或更改條款。"] },
      { heading: "社群內容同上載", paragraphs: ["你保留所提交內容嘅擁有權，並授權 CaliGuide 喺運作同改善服務所需範圍內託管、複製、顯示同處理相關內容。", "唔可以上載違法、騷擾、欺騙、侵權、不安全或侵犯私隱嘅內容，亦唔可以公開其他人嘅個人文件。CaliGuide 可以為保護用戶同服務而移除內容或限制帳戶。"] },
      { heading: "指南、翻譯同 AI", paragraphs: ["指南、論壇翻譯同聊天答案只提供一般資料。自動翻譯同 AI 輸出可能唔完整、過時或錯誤。重要事項請向引用嘅官方來源或合資格專業人士確認。", "CaliGuide 唔會因此同你建立律師、醫生、財務顧問或政府機關關係。"] },
      { heading: "責任同聯絡", paragraphs: ["喺法律允許範圍內，CaliGuide 按現況提供，唔保證每項結果都正確、不中斷或適合你嘅情況。你仍然要為使用服務所作嘅決定負責。", "條款問題請寄去 privacy@caliguide.org。正式公開發布前，呢啲條款應由合資格法律專業人士審閱。"] },
    ],
  },
  cookies: {
    title: "Cookie 同本機儲存通知",
    summary: "講解 CaliGuide 喺瀏覽器儲存乜嘢，同埋點樣控制可選儲存。",
    effectiveDate: EFFECTIVE_DATE,
    sections: [
      { heading: "必要儲存", paragraphs: ["必要儲存用於登入、安全、密碼重設、你主動發起嘅註冊流程同介面語言，所以無法透過「私隱選擇」關閉。"], items: ["Supabase authentication：安全保存工作階段同更新權杖狀態。", "caliguide-google-profile-draft：暫時保存完成 Google OAuth 註冊所需嘅資料。", "caliguide-privacy-consent：保存同意版本、分類選擇同更新時間。", "caliguide-language：作為必要功能儲存，記住你揀嘅介面語言。"] },
      { heading: "偏好儲存", paragraphs: ["喺你允許之前，可選偏好儲存保持關閉。拒絕偏好之後，瀏覽器會刪除本機聊天快取。"], items: ["caliguide-chat-memory：喺本裝置保存聊天快取；登入後嘅聊天記錄亦可能作為帳戶服務保存在 Supabase。"] },
      { heading: "分析同市場推廣", paragraphs: ["CaliGuide 目前冇安裝產品分析或廣告儲存。依家先提供控制，係為咗將來引入服務時呢啲分類仍然預設關閉。"] },
      { heading: "管理選擇", paragraphs: ["你可以隨時透過頁尾嘅「私隱選擇」接受、拒絕或自訂可選分類。清除瀏覽器網站資料可能會登出並重設偏好。", "本通知同時涵蓋 Cookie、本機儲存同用途相近嘅裝置技術。"] },
    ],
  },
  disclaimer: {
    title: "內容免責聲明",
    summary: "關於 CaliGuide 指南、社群帖文、翻譯同聊天答案嘅重要限制。",
    effectiveDate: EFFECTIVE_DATE,
    sections: [
      { heading: "只供一般資料", paragraphs: ["CaliGuide 為喺加州安頓嘅人整理一般資料，唔係律師事務所、醫療機構、財務顧問、報稅機構、政府機關或緊急服務。", "規則、費用、期限、資格同政府流程會改變。請查看指南日期同引用，並向負責嘅官方機關確認最新要求。"] },
      { heading: "社群同翻譯內容", paragraphs: ["論壇帖文同留言反映用戶個人經驗，唔一定經過 CaliGuide 核實。自動翻譯可能改變意思或遺漏重要脈絡。"] },
      { heading: "聊天助手同記憶", paragraphs: ["聊天助手可能產生錯誤或唔完整嘅答案。記憶功能用於保持對話連續性，唔係你嘅身分、法律狀態、健康、財務或期限嘅權威記錄。", "高影響決定唔好只依賴聊天答案；請查看官方來源，並喺需要時諮詢持牌專業人士。"] },
      { heading: "緊急情況同迫切期限", paragraphs: ["緊急情況請打 911。遇到迫切嘅法律、移民、醫療、住房或財務期限，請直接聯絡相關機關或合資格專業人士。"] },
    ],
  },
};

legalDocuments.es = {
  privacy: {
    title: "Política de privacidad",
    summary: "Cómo CaliGuide recopila, usa, almacena y comparte información cuando utilizas el servicio.",
    effectiveDate: EFFECTIVE_DATE,
    sections: [
      { heading: "Información que recopilamos", paragraphs: ["CaliGuide procesa datos de cuenta y perfil, como nombre, correo, fecha de nacimiento, selección de sexo, nacionalidad, ubicación actual y estado de llegada. También procesa publicaciones, comentarios, elementos guardados, conversaciones, imágenes y datos técnicos básicos.", "Las publicaciones, comentarios, nombres visibles e imágenes del foro están destinados a ser públicos para la comunidad. No publiques pasaportes, documentos migratorios, números financieros, historiales médicos ni otros documentos sensibles."] },
      { heading: "Cómo usamos la información", paragraphs: ["Usamos la información para autenticar cuentas, ofrecer guías y recursos guardados, operar el foro y el chatbot, recordar preferencias permitidas, proteger el servicio y resolver errores.", "CaliGuide no instala actualmente tecnología publicitaria ni de analítica de producto. Si esto cambia, el almacenamiento no esencial seguirá desactivado hasta que lo autorices."] },
      { heading: "Proveedores y transferencias", paragraphs: ["Supabase ofrece autenticación y base de datos; Cloudflare R2 almacena medios; Google OAuth permite iniciar sesión; Baidu Qianfan procesa mensajes e imágenes del chatbot; Mem0 guarda memoria del usuario. Estos proveedores pueden procesar datos fuera de tu estado o país.", "Envía al chatbot solo información que aceptes que procesen los proveedores de IA y memoria. CaliGuide puede enviar contexto y memoria relevante para responder preguntas posteriores."] },
      { heading: "Tus opciones, retención y contacto", paragraphs: ["Puedes rechazar almacenamiento opcional, cambiar tus Opciones de privacidad, editar campos disponibles y borrar contenido propio del foro cuando la función esté disponible. El almacenamiento de autenticación es necesario.", "En Perfil > Configuración puedes descargar una copia de los datos de tu cuenta o eliminarla permanentemente. La eliminación borra los datos propios en Supabase, los archivos en Cloudflare R2, los recuerdos de Mem0 y la identidad de Supabase Auth. Para ayuda con acceso o corrección, escribe a privacy@caliguide.org."] },
    ],
  },
  terms: {
    title: "Términos de uso",
    summary: "Reglas para usar cuentas, guías, comunidad, cargas y herramientas de IA de CaliGuide.",
    effectiveDate: EFFECTIVE_DATE,
    sections: [
      { heading: "Uso de CaliGuide", paragraphs: ["Debes proporcionar información correcta, proteger tus credenciales y usar el servicio legalmente. Eres responsable de la actividad de tu cuenta.", "CaliGuide puede cambiar, suspender o retirar funciones. La disponibilidad no está garantizada y los servicios externos pueden fallar o cambiar sus términos."] },
      { heading: "Contenido y archivos", paragraphs: ["Conservas la propiedad de lo que envías y autorizas a CaliGuide a alojarlo, mostrarlo y procesarlo para operar y mejorar el servicio.", "No subas contenido ilegal, abusivo, engañoso, infractor, peligroso o que viole la privacidad. CaliGuide puede retirar contenido o restringir cuentas para proteger a usuarios y al servicio."] },
      { heading: "Guías, traducciones e IA", paragraphs: ["Las guías, traducciones y respuestas son información general. La traducción automática y la IA pueden equivocarse. Confirma instrucciones importantes con la fuente oficial citada o un profesional calificado.", "CaliGuide no crea una relación de abogado, médico, asesor financiero ni agencia gubernamental."] },
      { heading: "Responsabilidad y contacto", paragraphs: ["En la medida permitida por la ley, CaliGuide se ofrece según disponibilidad, sin garantizar que cada resultado sea exacto, continuo o adecuado para tu situación.", "Envía preguntas a privacy@caliguide.org. Un profesional legal calificado debe revisar estos términos antes de un lanzamiento público completo."] },
    ],
  },
  cookies: {
    title: "Aviso de cookies y almacenamiento local",
    summary: "Qué guarda CaliGuide en tu navegador y cómo controlar el almacenamiento opcional.",
    effectiveDate: EFFECTIVE_DATE,
    sections: [
      { heading: "Almacenamiento necesario", paragraphs: ["Mantiene el inicio de sesión, la seguridad, la recuperación de contraseña, los registros solicitados y el idioma de la interfaz. No se puede desactivar en Opciones de privacidad."], items: ["Supabase authentication: conserva la sesión y el token de actualización.", "caliguide-google-profile-draft: datos temporales para completar un registro con Google OAuth.", "caliguide-privacy-consent: versión, categorías y fecha de tus elecciones.", "caliguide-language: almacenamiento funcional necesario que recuerda el idioma de interfaz elegido."] },
      { heading: "Preferencias", paragraphs: ["El almacenamiento opcional permanece desactivado hasta que lo aceptes. Al rechazarlo, se elimina la caché local del chatbot."], items: ["caliguide-chat-memory: caché local del chatbot; el historial de una cuenta también puede guardarse en Supabase."] },
      { heading: "Analítica y marketing", paragraphs: ["CaliGuide no instala actualmente almacenamiento de analítica ni publicidad. Los controles existen para mantener esas categorías desactivadas de forma predeterminada si se añaden servicios en el futuro."] },
      { heading: "Administrar opciones", paragraphs: ["Usa Opciones de privacidad en el pie para aceptar, rechazar o personalizar categorías. Borrar datos del sitio puede cerrar tu sesión y reiniciar preferencias.", "Este aviso incluye cookies, almacenamiento local y tecnologías de dispositivo similares."] },
    ],
  },
  disclaimer: {
    title: "Descargo de responsabilidad",
    summary: "Límites importantes de las guías, publicaciones, traducciones y respuestas del chatbot.",
    effectiveDate: EFFECTIVE_DATE,
    sections: [
      { heading: "Solo información general", paragraphs: ["CaliGuide organiza información general para personas que se establecen en California. No es firma legal, proveedor médico, asesor financiero, preparador fiscal, agencia pública ni servicio de emergencias.", "Las reglas, tarifas, plazos y procedimientos cambian. Revisa la fecha y las citas de cada guía y confirma requisitos con la agencia oficial."] },
      { heading: "Comunidad y traducciones", paragraphs: ["Las publicaciones reflejan experiencias personales y no siempre están verificadas. Las traducciones automáticas pueden cambiar el significado u omitir contexto."] },
      { heading: "Chatbot y memoria", paragraphs: ["El chatbot puede dar respuestas incorrectas o incompletas. Su memoria ayuda a continuar la conversación, pero no es un registro oficial de identidad, estatus, salud, finanzas o plazos.", "No uses una respuesta como única fuente para una decisión importante. Consulta fuentes oficiales y profesionales con licencia cuando sea necesario."] },
      { heading: "Emergencias y plazos urgentes", paragraphs: ["Llama al 911 en una emergencia. Para plazos legales, migratorios, médicos, de vivienda o financieros, contacta directamente a la agencia o profesional correspondiente."] },
    ],
  },
};

export function getLegalDocument(pageId: LegalPageId, language: LanguageCode) {
  return legalDocuments[language][pageId];
}
