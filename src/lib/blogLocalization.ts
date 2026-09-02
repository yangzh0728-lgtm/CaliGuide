import type { LanguageCode } from "../i18n/translations";
import { ENGLISH_BLOG_BODIES, SPANISH_BLOG_BODIES } from "./blogBodyTranslations";
import { BLOG_ARTICLES, BlogArticle, getBlogArticle } from "./blogContent";
import { getGuideCitationSet } from "./guideCitations";

export type OfficialContentLanguage = "en" | "zh-CN" | "zh-TW" | "es";

type BlogArticleTranslation = Partial<
  Pick<BlogArticle, "title" | "category" | "readTime" | "tags" | "excerpt" | "body">
>;

export const OFFICIAL_CONTENT_LANGUAGES: OfficialContentLanguage[] = ["en", "zh-CN", "zh-TW", "es"];

const RECOMMENDED_ARTICLE_IDS = [
  "guide-1",
  "guide-real-id-documents",
  "guide-2",
  "guide-rental-scams",
  "guide-first-doctor-visit",
  "guide-legal-30-day-documents",
  "guide-newcomer-job-search",
  "guide-school-esl-resources",
  "guide-california-transportation",
  "guide-earthquake-wildfire-preparedness",
  "guide-notario-fraud",
  "guide-workers-rights-wage-theft",
];

const zhCnPatches: Record<string, BlogArticleTranslation> = {
  "category-dmv": {
    title: "新居民加州 DMV 办事清单",
    tags: ["DMV", "驾照", "REAL ID", "加州"],
    excerpt: "帮助新居民规划最常见的 DMV 事项，包括驾照、REAL ID、车辆登记和地址更新。",
    body: [
      "适合人群：刚搬到加州、需要办理驾照或州身份证、考虑 REAL ID、从外州带车进入加州，或需要更新 DMV 地址的新居民。",
      "准备清单：护照或其他身份证明、加州住址证明、Social Security 信息、外州驾照或车辆登记、预约确认、申请费付款方式、车辆保险和注册文件。",
      "先确认你最需要办理的 DMV 事项：加州驾照、州身份证、REAL ID、车辆登记或地址更新。新居民应查看官方 DMV 时间要求，因为截止日期可能取决于何时建立加州居民身份，以及是否从外州带车进入加州。",
      "预约前整理身份、住址和合法居留相关材料。常见材料包括护照或其他身份证明、加州住址证明、适用时的 Social Security 信息，以及已有的外州驾照或车辆登记。",
      "访问 DMV 官网确认表格、费用、考试要求和预约情况。许多步骤可以在线开始，但到现场前仍应用官方页面核对最新规则。",
      "办理后保存收据、临时文件、考试结果和续期提醒。正式驾照或 REAL ID 邮寄到家后，应立即核对姓名和地址是否正确。",
      "常见错误：只带复印件没有原件、住址证明姓名或地址不一致、没有提前确认 REAL ID 材料、路考车辆保险或注册无效、搬家后没有更新 DMV 地址。",
      "官方提醒：DMV 要求会因年龄、身份文件、申请类型和车辆情况而不同。提交申请前应使用加州 DMV 官方页面和文件清单确认最新要求。",
    ],
  },
  "forum-first-30-days": {
    title: "加州前 30 天指南",
    category: "社区指南",
    tags: ["前 30 天", "新居民", "文件", "办理顺序"],
    excerpt: "许多新居民遇到延误，是因为办理顺序不对。本指南按照事项之间的依赖关系安排第一个月，帮助你先启动正确的任务。",
    body: [
      "适合人群：计划在未来 30 天内抵达加州，或抵达加州不满 30 天的人。本指南重点说明事项之间的办理顺序，不重复每篇专题指南中的详细要求。",
      "先后依赖关系：美国邮寄地址可以帮助你办理银行账户、DMV 预约、学校注册和水电网络账户。Social Security Number 或 ITIN 可能用于工资和许多信用产品。REAL ID 通常需要两份不同的住址证明。先启动需要排队等待的事项，因为等待时间无法压缩。",
      "准备清单：美国电话号码、可持续使用 30 天的邮寄地址、加密保存的文件扫描件、护照和签证原件、I-94 记录、孩子的学校记录、银行开户存款",
      "出发前：扫描护照、签证、I-94 记录、出生证明、结婚证明和移民批准通知。保留一份加密电子副本，所有原件随身携带，不要放入托运行李。确定第一个月使用的邮寄地址。如果有学龄儿童，应在离开前索取学校记录和疫苗接种记录。",
      "第 1 至 3 天保持可联系：机构能够联系到你后，许多后续事项才可以开始。准备美国电话号码，因为部分机构和银行不会向国际号码发送验证码。确认一个至少可使用 30 天的邮寄地址，因为住址证明需要时间积累。建立一个纸质和电子文件夹。跳过这一步会拖慢多个后续事项。",
      "第 1 周启动长期等待事项：有些事项可能存在无法缩短的等待期，即使其他事情看起来更紧急，也应现在开始。根据个人情况预约尽早可办理的 Social Security 服务。尝试开设银行账户；如果还没有 SSN，先确认哪些机构接受护照和 ITIN。",
      "第 2 至 3 周使用住址：信件寄到住址后，产生的文件可以帮助你完成后续步骤。申请驾照或州身份证，并确认是否需要 REAL ID。为孩子在实际居住地址对应的学区办理注册。研究医疗保险，因为搬到加州可能触发特殊投保期。设置水电和网络服务。",
      "第 4 周找出阻碍：不要只是继续勾选清单，而要问每个未完成事项正在等待什么。REAL ID 申请停滞，可能是因为只有一份住址证明。工作入职停滞，可能涉及工作授权，而不只是 SSN 卡。租房屡次被拒，可能是缺少美国信用记录，而不一定是收入问题。求助前先明确阻碍。",
      "第一个月的安全事项：加州有些风险可能并不熟悉。了解地震发生时应该怎样行动，以及山火疏散警告和疏散命令的区别。了解无论移民身份如何，加州工资和工作场所安全保护都适用。了解在美国 notario 并不等于律师，因为这个误解可能造成严重伤害。",
      "常见错误：没有美国地址或电话号码就先申请银行账户、没有任何邮件住址证明就预约 DMV、误以为 Social Security Number 本身等于工作授权、只收集一份住址证明就申请 REAL ID、等待永久住房后才加入 SSN 预约队列、向声称可以加快政府流程的人付款",
      "官方提醒：本指南只说明办理顺序。具体要求、期限和资格取决于移民身份、所在县和当前政策。行动前应通过相应专题指南及其官方来源确认每一步。",
    ],
  },
  "trending-ssn": {
    title: "如何申请 Social Security Number（SSN）",
    category: "社区指南",
    tags: ["SSN", "Social Security", "申请", "材料"],
    excerpt: "确认资格、选择申请方式、准备材料，并在美国任何地区寻找 Social Security 服务。",
    body: [
      "适合人群：首次申请 Social Security Number、需要补发或更正卡片，以及需要了解移民身份和工作授权如何影响资格的非公民。",
      "先确认资格：美国公民和许多获得国土安全部工作授权的非公民可以申请 SSN。合法入境但没有工作授权的非公民，通常需要法律承认的有效非工作理由。SSN 卡本身不代表工作许可。",
      "选择申请方式：先使用 SSA 官方 Number and Card 工具。有些人可在提交符合条件的 USCIS 移民或工作授权表格时同时申请 SSN；其他人可以在线开始，再向 Social Security 完成后续步骤。如果已通过 USCIS 申请 SSN，不要重复提交。",
      "准备清单：有效身份证件、年龄证明、美国公民身份证明或当前移民及工作授权文件、完整申请信息、适用时的预约确认、原件或由签发机构认证的副本而不是普通复印件或公证副本",
      "寻找附近服务：使用 SSA 官方办公室定位器，输入地址或邮编。各地办公流程和预约情况可能不同，出发前应确认该业务能否在线或电话办理，或是否必须预约。本指南适用于全美，不限于加州某个城市。",
      "现场办理：携带 SSA 根据个人情况列出的材料，并预留身份和资格审核时间。申请原始或补发 Social Security 卡免费。保存收据或确认信息，并安全保管 SSN 和身份文件。",
      "申请后：留意申请时提供的邮寄地址，卡片寄到后核对姓名。如未在 SSA 告知的时间内收到卡片，应直接联系 SSA。补卡、姓名更正和移民身份更新可能需要不同的在线或现场步骤。",
      "常见错误：认为 SSN 等于工作授权、只带普通复印件、向中介支付免费 SSA 服务的费用、使用虚假或他人号码、重复申请、只相信非官方预约信息、向未核实的人或网站发送身份文件",
      "官方提醒：资格和材料要求取决于公民身份、移民身份、工作授权、年龄和申请类型。使用 SSA Number and Card 工具获取个人化办理路径，提交材料前直接向 Social Security 确认最新说明。",
    ],
  },
  "guide-moving-address-checklist": {
    title: "在加州搬家后需要更新的地址和账户",
    category: "住房",
    tags: ["搬家", "地址更新", "USCIS", "DMV", "清单"],
    excerpt: "按时间整理 USPS、政府记录、保险、银行、水电燃气和其他重要账户的加州搬家更新清单。",
    body: [
      "适合人群：在加州境内更换地址，以及搬入或搬出加州的居民。本指南区分联邦义务、加州期限和服务商更新，帮助你先处理紧急记录，再处理日常账户。",
      "期限表：把下面的清单作为搬家控制中心。政府期限只在相应机构和规则适用于你时生效；服务商时间是实用建议，不是法律期限。保存所有确认记录，直到邮件和账户都显示新地址。",
      "搬家日前：通过 USPS 官网或邮局提交邮件转寄，提前安排水电燃气的停止和开通日期，并在下一个发薪周期前更新雇主或工资系统。邮件转寄只是安全网，不能代替直接通知每个机构。",
      "10 天内：多数非公民必须在搬家后 10 天内向 USCIS 报告新地址，但应查看 USCIS 的例外。USPS 邮件转寄不会更新 USCIS，USPS 也说明不会转寄 USCIS 邮件。加州 DMV 同样要求在 10 天内更新地址。分别检查驾照或身份证，以及每辆汽车、船只或残障停车证记录，不要假设一次更新会覆盖全部记录。符合资格的加州选民应在下一次选举截止日前确认登记地址。",
      "两周内：更新银行、信用卡、贷款机构、汽车保险、租客保险、医疗保险、医疗机构和税务通信地址。应向汽车保险公司报告车辆主要停放地址；地点会用于加州汽车保险定价和记录。需要通知 IRS 家庭邮寄地址变化时，可使用 Form 8822。",
      "水电和服务：确认电力、燃气、自来水、垃圾、网络、手机、家庭安防、订阅、学校、托儿、宠物登记、停车许可、收费公路账户和配送资料。可以记录最终表数，归还租用设备，并检查首张和末张账单是否有重复收费。",
      "通常不需要更新的项目：一般不需要为 Social Security 卡本身更改地址。如果领取 Social Security 福利或 Medicare，应按 SSA 提供的流程更新邮寄地址。SSI 领取者有不同的申报步骤，应及时报告相关地址或居住安排变化。Login.gov 或 ID.me 的账户安全电话号码也可能与 SSA 福利联系信息分开。",
      "搬家期间保护自己：只使用 USPS.com 办理邮件转寄；第三方网站可能收取远高于官方身份验证费的费用。保护过渡期间的邮件，在大额消费前更新银行卡账单地址，使用不同的强密码，并保存截图、收据、案件编号和生效日期。政府地址更新不会要求礼品卡或加密货币付款。",
      "常见错误：把 USPS 邮件转寄当作已通知 USCIS，只更新 DMV 驾照却没有更新车辆记录，搬家后才安排水电服务，忘记汽车保险的主要停放地址，只更改银行邮寄地址却没有更改银行卡账单地址，丢弃确认号码，或没有核实就认为选民登记已经更新",
      "官方提醒：地址规则取决于移民身份、福利类型、搬家方向、选举时间和所持记录。使用本清单前，应通过 USPS、USCIS、加州 DMV、SSA、IRS、选举办公室和各服务商确认最新要求。",
    ],
  },
  "guide-earthquake-wildfire-preparedness": {
    category: "安全",
  },
  "guide-notario-fraud": {
    category: "法律",
  },
  "guide-workers-rights-wage-theft": {
    category: "就业",
  },
};

const englishTranslations: Record<string, BlogArticleTranslation> = {
  "category-dmv": {
    title: "DMV Checklist for New California Residents",
    category: "DMV",
    tags: ["DMV", "Driver License", "REAL ID", "California"],
    excerpt: "Plan your first DMV tasks, including licenses, REAL ID documents, vehicle registration, and address updates.",
    body: [
      "Who this helps: new California residents who need a driver's license or state ID, people deciding whether to apply for REAL ID, and residents bringing a vehicle from another state.",
      "Preparation checklist: Passport or other identity document, California address proof, Social Security information when applicable, out-of-state license or vehicle registration, appointment confirmation, fee payment method, vehicle insurance, vehicle registration.",
      "Start by deciding which DMV task you need first: a California driver's license, state ID, REAL ID, vehicle registration, or address update. New residents should review official DMV timelines because deadlines can depend on when they establish residency and whether they bring a vehicle from another state.",
      "Before booking an appointment, organize identity, residency, and legal-presence documents. Common documents include a passport or other identity proof, proof of California address, Social Security information when applicable, and any existing out-of-state license or registration.",
      "Use the DMV website to check forms, fees, test requirements, and appointment availability before visiting an office. Many steps can start online, but users should confirm current rules on the official DMV site before relying on any checklist.",
      "After the visit, keep receipts, temporary paperwork, test results, and renewal reminders together. If a REAL ID or license card arrives by mail, verify the name and address as soon as it is delivered.",
      "Common mistakes: bringing copies without originals, using address documents with mismatched names, skipping the REAL ID checklist, arriving for a road test with invalid insurance or registration, or forgetting to update a DMV address after moving.",
      "Official reminder: DMV requirements can vary by age, identity document, application type, and vehicle situation. Confirm the latest requirements with California DMV official pages and document checklists before applying.",
    ],
  },
  "category-banking": {
    title: "How Newcomers Can Open a U.S. Bank Account",
    category: "Banking",
    tags: ["U.S. banking", "Bank account", "Checking", "Savings", "Newcomers"],
    excerpt: "Choose a bank account, prepare identity documents, understand fees, and keep your new account secure.",
    body: [
      "Who this helps: newcomers who do not yet have a U.S. bank account, people who need to receive pay or pay rent, and residents comparing banks, online banks, and credit unions.",
      "Prepare a passport or government photo ID, a second ID if available, SSN or ITIN if applicable, U.S. address, phone number, email, initial deposit, and any work, school, or immigration documents the bank may request.",
      "Compare branch access, ATM coverage, mobile banking, language support, monthly fees, minimum balances, overdraft fees, wire fees, and account closing rules. Checking accounts are usually for daily spending and paychecks; savings accounts are for reserve funds.",
      "Confirm deposit insurance before opening an account. Banks should be FDIC-insured; credit unions should have the appropriate federal share insurance. Do not choose only because of a signup bonus.",
      "After opening the account, set a strong password, two-factor authentication, transaction alerts, and card lock tools. Keep the fee schedule, routing number, account number, and bank contact information private and organized.",
    ],
  },
  "category-housing": {
    title: "First California Rental Checklist",
    category: "Housing",
    tags: ["California rentals", "Rental checklist", "Lease", "Deposit", "Newcomer housing"],
    excerpt: "Prepare for your first California rental from budget and search to applications, lease signing, payment, and move-in inspection.",
    body: [
      "Who this helps: first-time renters in California, newcomers without U.S. credit or rental history, and tenants preparing income, identity, and deposit documents.",
      "Build a complete housing budget that includes rent, utilities, internet, parking, laundry, commuting, and renters insurance. Compare the actual commute, school access, transit, parking, and neighborhood services before applying.",
      "Prepare a rental packet with identification, income or funds proof, references, and an explanation if you do not have U.S. credit. Verify the listing and the person renting the unit before sending sensitive documents.",
      "Before signing, ask for written costs: application fee, deposit, first month rent, parking, pet fees, and other charges. Review lease length, due dates, late fees, repairs, guests, pets, subletting, early termination, and renewal terms.",
      "Use traceable payment methods and save receipts. On move-in day, photograph walls, floors, appliances, doors, windows, alarms, and existing damage so deposit questions are easier to resolve later.",
    ],
  },
  "category-health": {
    title: "California Health Insurance Basics",
    category: "Health",
    tags: ["California health insurance", "Covered California", "Medi-Cal", "Newcomer healthcare"],
    excerpt: "Understand employer coverage, Covered California, Medi-Cal, and out-of-pocket care before choosing a plan.",
    body: [
      "Who this helps: newcomers without health coverage, families comparing employer insurance, Covered California, and Medi-Cal, and people choosing a U.S. health plan for the first time.",
      "Prepare household member details, California address, SSN if applicable, immigration document numbers when relevant, employer and income information, current coverage dates, doctors, hospitals, prescriptions, and a monthly budget.",
      "Check employer coverage first, including the enrollment date, employer contribution, family cost, and effective date. Covered California is the official marketplace where eligible residents can compare plans and possible subsidies.",
      "Medi-Cal is California's Medicaid program for eligible residents with income and other qualifying factors. Different household members can receive different eligibility results depending on age, income, status, and other rules.",
      "Compare total cost, not just premium: deductible, copay, coinsurance, out-of-pocket maximum, doctor network, hospitals, mental health, pharmacy, and prescriptions all matter.",
    ],
  },
  "guide-1": {
    title: "How to Apply for a California Driver's License",
    category: "DMV",
    tags: ["California driver's license", "DMV", "Knowledge test", "Road test", "Newcomers"],
    excerpt: "Learn which documents, tests, appointments, and DMV steps first-time California license applicants should expect.",
    body: [
      "Who this helps: new California residents, adults applying for a U.S. license for the first time, drivers with a foreign or out-of-state license, and applicants comparing a standard license, REAL ID license, or AB 60 license.",
      "Preparation checklist: Identity and legal-presence documents, California address proof, SSN information if applicable, existing licenses, fee payment, study materials, road-test vehicle, valid registration, valid insurance.",
      "Choose the correct license type before applying. A standard license, REAL ID license, and AB 60 license have different document rules and uses; AB 60 cannot be used as REAL ID.",
      "Start the online driver's license or ID application, then visit DMV to verify documents, take a photo, provide fingerprints, pay fees, and complete required tests.",
      "Study the latest California Driver's Handbook for the vision and knowledge tests. Do not rely only on unofficial practice questions. If you do not already have a qualifying license, you may need an instruction permit before practicing.",
      "Before scheduling a road test, make sure the vehicle is safe to drive and has valid registration and insurance. Practice turns, parking, lane changes, traffic observation, and speed control. After passing, DMV usually issues a temporary license first and mails the official card to the address on file.",
      "Common mistakes: choosing the wrong license type, bringing copies instead of originals or certified documents, using address documents that do not match, arriving for a road test in a vehicle without valid insurance or registration, assuming a foreign license removes California test requirements, or moving after applying without updating the mailing address.",
      "Official reminder: Driver license requirements vary by age, document type, and license category. Use the California DMV document checklist and latest Driver's Handbook before applying or taking a test.",
    ],
  },
  "guide-real-id-documents": {
    title: "REAL ID Document Preparation Guide",
    category: "DMV",
    tags: ["REAL ID", "California DMV", "Identity proof", "Address proof", "Airport ID"],
    excerpt: "Organize identity, SSN, California address, and name-change documents before applying for REAL ID.",
    body: [
      "Who this helps: residents applying for their first California REAL ID, upgrading from a standard license or ID, or preparing documents for federal identification uses.",
      "Prepare one accepted identity document, two California residency documents, SSN information or an applicable exception, name-change documents, your current ID, and DMV online application confirmation.",
      "Confirm whether you need REAL ID. It is not required to drive, but a standard driver's license or ID will not serve as a federally compliant identification document.",
      "Use the DMV REAL ID checklist for your situation. Identity documents must generally show your full legal name and date of birth, and residency documents should show the same California physical address.",
      "If names do not match across documents, prepare official connecting documents such as a marriage certificate, divorce decree, or court order.",
    ],
  },
  "guide-2": {
    title: "California Rental Handbook",
    category: "Housing",
    tags: ["California rentals", "Rental checklist", "Lease", "Security deposit", "Housing"],
    excerpt: "A practical rental guide for budgeting, apartment tours, applications, deposits, lease review, and move-in documentation.",
  },
  "guide-rental-scams": {
    title: "California Rental Scams and How to Avoid Them",
    category: "Housing",
    tags: ["Rental scams", "Fake landlords", "California rentals", "Deposit fraud"],
    excerpt: "Spot fake listings, impersonated landlords, false agents, and payment requests that often signal rental fraud.",
    body: [
      "Who this helps: people searching on listing sites, social media, classified ads, or from outside California who may feel pressure to secure housing quickly.",
      "Collect the full address, landlord or property manager name, broker license information if relevant, price comparisons, tour details, lease copy, written fees, and payment receipts.",
      "Be careful with prices far below similar nearby rentals. Search the address across platforms and compare whether the contact person, price, and listing status match.",
      "Verify the person renting the unit. A social media profile, email signature, or photo of an ID is not enough. Tour in person or by live video when possible; prerecorded videos do not prove current authority to rent.",
      "Avoid unusual payment requests such as wire transfers, gift cards, cryptocurrency, or payments to unknown third parties. Save screenshots, emails, phone numbers, payment instructions, and receipts for reporting if needed.",
    ],
  },
  "forum-first-30-days": {
    title: "First 30 Days in California",
    category: "Community Guide",
    tags: ["First 30 Days", "Newcomer", "Documents", "Sequencing"],
    excerpt: "Most newcomer delays come from doing things in the wrong order. This guide sequences your first month by what blocks what so you can start the right task first.",
    body: getBlogArticle("forum-first-30-days")?.body,
  },
  "trending-ssn": {
    title: "How to Apply for a Social Security Number (SSN)",
    category: "Community Guide",
    tags: ["SSN", "Social Security", "Application", "Documents"],
    excerpt: "Check eligibility, choose the correct application path, prepare documents, and find Social Security help anywhere in the United States.",
    body: getBlogArticle("trending-ssn")?.body,
  },
  "guide-moving-address-checklist": {
    title: "Moving in California: Every Address and Account to Update",
    category: "Housing",
    tags: ["Moving", "Address Change", "USCIS", "DMV", "Checklist"],
    excerpt: "A timed California checklist for updating mail, government records, insurance, banking, utilities, and other essential accounts after a move.",
    body: getBlogArticle("guide-moving-address-checklist")?.body,
  },
  "trending-banking": {
    title: "Banking Steps You Can Take Without an SSN",
    category: "Trending Question",
    tags: ["No SSN", "ITIN", "Bank account", "Passport", "Newcomer finance"],
    excerpt: "Prepare alternate documents, compare bank policies, and protect your finances while waiting for an SSN.",
    body: [
      "Who this helps: newcomers who do not yet have an SSN, people preparing for an ITIN, and anyone who needs to receive funds or pay bills safely.",
      "Prepare a valid passport, second government ID, ITIN documents if available, U.S. address proof, phone number, email, visa, I-94 or other status documents, initial deposit, and a list of banks that serve non-SSN customers.",
      "Understand the difference between SSN and ITIN. An ITIN is for federal tax purposes; it is not work authorization and does not replace every service that asks for an SSN.",
      "Call several banks or credit unions and ask directly whether they can open an account without an SSN and whether they accept ITIN, foreign passport, or other government ID.",
      "Do not use a fake SSN, buy a so-called SSN from an agent, or keep wages in someone else's account. Keep notes on each bank's requirements and update your profile later if you receive an SSN or ITIN.",
    ],
  },
  "guide-first-doctor-visit": {
    title: "Your First Doctor Visit in the United States",
    category: "Health",
    tags: ["U.S. doctor visit", "Primary care", "Medical appointment", "Insurance network", "Medical bills"],
    excerpt: "Find a doctor, make an appointment, prepare for the visit, handle prescriptions, and understand bills.",
    body: [
      "Who this helps: people using U.S. health insurance for the first time, patients who need a primary care provider, and families who need language support during medical visits.",
      "Prepare insurance card, photo ID, PCP name, clinic address, symptom timeline, medications and dosages, allergies, medical history, vaccine records, overseas test results, questions, preferred language, and copay method.",
      "Choose the right care setting. Routine care and non-emergency symptoms usually start with primary care; urgent or life-threatening symptoms require emergency services.",
      "Use your plan's official provider directory and call to confirm the doctor accepts your plan and new patients. Ask whether specialist visits, labs, imaging, or prescriptions require referrals or authorization.",
      "After the visit, confirm where to get tests, how to see results, how to take medication, and whom to contact for side effects. An Explanation of Benefits is usually not a bill; compare any bill with your insurance records.",
    ],
  },
  "guide-legal-30-day-documents": {
    title: "Document Plan for the 30 Days Before Moving to California",
    category: "Legal",
    tags: ["Immigration documents", "Arrival prep", "I-94", "Document organization", "Moving to California"],
    excerpt: "Organize identity, arrival, family, medical, education, and financial documents before you move.",
    body: [
      "Who this helps: people moving to California within 30 days, families traveling together, and newcomers who will need documents for DMV, school, banking, housing, and healthcare.",
      "Create folders for identity, family, medical, education, work, banking, housing, and transportation. Keep originals in carry-on luggage, not checked baggage.",
      "Prepare passports, visas, approval notices, I-20, DS-2019, EAD, green card or status documents, birth and marriage records, custody documents, driving records, vaccines, school records, employment contracts, bank proof, insurance, and emergency contacts.",
      "Check name spelling and date consistency across documents. If records use different names or languages, ask in advance whether certified translations are needed.",
      "After arrival, eligible nonimmigrants should check the electronic I-94, and many noncitizens must update their USCIS address after moving. This is an organizing checklist, not legal advice.",
    ],
  },
  "guide-newcomer-job-search": {
    title: "Newcomer Job Search Checklist",
    category: "Jobs",
    tags: ["Newcomer jobs", "U.S. resume", "Work authorization", "I-9", "California employment"],
    excerpt: "Confirm work eligibility, prepare a U.S.-style resume, organize employment documents, and search safely.",
    body: [
      "Who this helps: newcomers seeking their first California job, people with overseas education or work experience, and applicants confirming work authorization and I-9 documents.",
      "Prepare proof of work authorization, acceptable I-9 documents, a one- or two-page English resume, role-specific resume versions, LinkedIn profile, education and license records, references, professional email, voicemail, and an application tracker.",
      "Do not assume having an SSN means you are authorized to work. Employers use Form I-9 after hire to verify identity and employment authorization, and they should not force one specific document if alternatives are allowed.",
      "A U.S. resume usually highlights skills and results and does not include photo, age, marital status, passport number, or SSN. Adjust keywords for each job.",
      "Check whether your target role requires credential evaluation, a California license, background check, or exam. Use company sites, reliable job boards, CalJOBS, professional associations, school resources, and AJCC services.",
    ],
  },
  "guide-school-esl-resources": {
    title: "School Enrollment and ESL Resources for Children",
    category: "Education",
    tags: ["California school enrollment", "ESL", "English Learner", "Newcomer students", "School district"],
    excerpt: "Find your school district, prepare enrollment documents, and understand English Learner and newcomer student support.",
    body: [
      "Who this helps: newcomer families with school-age children, students transferring from another country or state, and parents seeking language support.",
      "Prepare California address, proof of age, parent or guardian ID, residency proof, immunization and medical records, past transcripts, course and credit records for older students, special education or medical plans, custody documents, translations, language needs, and emergency contacts.",
      "Start with the school district for your actual address and contact the enrollment office. Ask for the official checklist because local document rules vary.",
      "Schools may use a home language survey and English proficiency assessment to determine English Learner services. Ask whether support is in-class, a designated English development course, bilingual program, or newcomer program.",
      "Parents can ask for translated documents and interpretation for meetings. Do not rely on children to interpret complex school administration or special education discussions.",
    ],
  },
  "guide-california-transportation": {
    title: "California Commuting, Car Buying, and Insurance Basics",
    category: "Transportation",
    tags: ["California commute", "Buying a car", "Car insurance", "Vehicle registration", "Newcomer transportation"],
    excerpt: "Compare public transit and car ownership costs, then understand buying, registration, and insurance basics.",
    body: [
      "Who this helps: newcomers deciding whether to buy a car, planning work or school commutes, buying a first U.S. vehicle, bringing a car from another state or country, or learning insurance and DMV registration rules.",
      "Compare transit, commuter rail, biking, walking, employer shuttles, rideshare, and carpooling by route, time, transfers, and night service. Specific routes matter more than a city's general reputation.",
      "Calculate full car cost: purchase price or payment, sales tax, registration, loan interest, insurance, fuel or charging, parking, maintenance, and repairs. Get insurance quotes before choosing a car.",
      "For used cars, check title, VIN, accident or salvage history, and consider an independent mechanic inspection. Dealer transactions and private sales have different protections.",
      "California generally requires insurance or another accepted proof of financial responsibility for vehicles driven or parked on public roads. Minimum coverage may not be enough for every household.",
    ],
  },
  "guide-earthquake-wildfire-preparedness": {
    title: "California Earthquake and Wildfire Preparedness",
    category: "Safety",
    tags: ["Earthquake", "Wildfire", "Evacuation", "Go bag", "Air quality"],
    excerpt: "Set up earthquake alerts, plan wildfire evacuation, build a go bag, and protect your household from smoke.",
  },
  "guide-notario-fraud": {
    title: "Avoid Notario Immigration Fraud",
    category: "Legal",
    tags: ["Notario", "Immigration fraud", "Legal help", "Attorney lookup", "Immigration services"],
    excerpt: "Recognize unauthorized immigration advice and verify a licensed attorney or DOJ-accredited representative.",
  },
  "guide-workers-rights-wage-theft": {
    title: "California Worker Rights and Wage Theft",
    category: "Jobs",
    tags: ["Worker rights", "Wage theft", "Minimum wage", "Overtime", "Retaliation"],
    excerpt: "Track hours and pay, recognize wage theft, and understand California complaint and retaliation protections.",
  },
};

const spanishTranslations: Record<string, BlogArticleTranslation> = {
  "category-dmv": {
    title: "Lista del DMV para nuevos residentes de California",
    category: "DMV",
    tags: ["DMV", "Licencia de conducir", "REAL ID", "California"],
    excerpt: "Planifica tus primeros trámites del DMV: licencia, REAL ID, registro del vehículo y cambio de dirección.",
    body: [
      "A quién ayuda: nuevos residentes de California que necesitan licencia de conducir o identificación estatal, personas que están considerando REAL ID y residentes que traen un vehículo de otro estado.",
      "Lista de preparación: Pasaporte u otro documento de identidad, comprobante de domicilio en California, información del Seguro Social si aplica, licencia o registro vehicular de otro estado, confirmación de cita, forma de pago, seguro del vehículo, registro del vehículo.",
      "Primero decide qué trámite necesitas: licencia de California, identificación estatal, REAL ID, registro del vehículo o cambio de dirección. Los plazos pueden depender de cuándo estableces residencia y de si traes un vehículo de otro estado.",
      "Prepara documentos de identidad, residencia y presencia legal antes de pedir cita. También lleva cualquier licencia o registro de otro estado si aplica.",
      "Usa el sitio oficial del DMV para confirmar formularios, costos, exámenes y citas. Muchas gestiones empiezan en línea, pero las reglas actuales deben verificarse en la fuente oficial.",
      "Después de la visita, guarda recibos, documentos temporales, resultados de exámenes y recordatorios. Cuando llegue la tarjeta, revisa nombre y dirección.",
      "Errores comunes: llevar copias sin originales, usar comprobantes de dirección con nombres diferentes, saltar la lista de REAL ID, presentarse al examen práctico con seguro o registro inválido, u olvidar actualizar la dirección en el DMV después de mudarse.",
      "Recordatorio oficial: Los requisitos del DMV pueden variar por edad, documento de identidad, tipo de solicitud y situación del vehículo. Confirma los requisitos actuales en páginas y listas oficiales del DMV de California antes de aplicar.",
    ],
  },
  "category-banking": {
    title: "Cómo abrir una cuenta bancaria en EE. UU. siendo recién llegado",
    category: "Banca",
    tags: ["Banca en EE. UU.", "Cuenta bancaria", "Cuenta corriente", "Ahorros", "Recién llegados"],
    excerpt: "Elige una institución, prepara documentos de identidad, compara cargos y protege tu cuenta nueva.",
    body: [
      "Esta guía ayuda a quienes aún no tienen cuenta bancaria en EE. UU., necesitan recibir salario o pagar renta, o quieren comparar bancos y cooperativas de crédito.",
      "Prepara pasaporte o identificación oficial, una segunda identificación si la tienes, SSN o ITIN si aplica, dirección en EE. UU., teléfono, correo, depósito inicial y documentos de trabajo, escuela o inmigración.",
      "Compara sucursales, cajeros, banca móvil, idiomas, cargos mensuales, saldo mínimo, sobregiros, transferencias internacionales y condiciones para cerrar la cuenta.",
      "Confirma que el banco esté asegurado por FDIC o que la cooperativa tenga protección federal equivalente. No elijas solo por un bono de apertura.",
      "Después de abrir la cuenta, activa contraseña fuerte, doble factor, alertas y bloqueo de tarjeta. Guarda el contrato, cargos, routing number y account number con cuidado.",
    ],
  },
  "category-housing": {
    title: "Checklist para rentar por primera vez en California",
    category: "Vivienda",
    tags: ["Rentas en California", "Checklist de renta", "Contrato", "Depósito", "Vivienda"],
    excerpt: "Prepárate para presupuesto, búsqueda, solicitud, contrato, pagos e inspección de mudanza.",
    body: [
      "Esta guía ayuda a quienes rentan por primera vez en California o no tienen historial de crédito o renta en EE. UU.",
      "Haz un presupuesto completo: renta, servicios, internet, estacionamiento, lavandería, transporte y seguro de inquilino.",
      "Prepara identificación, comprobantes de ingreso o fondos, referencias y una explicación si no tienes crédito estadounidense. Verifica el anuncio y a la persona que renta antes de enviar documentos sensibles.",
      "Antes de firmar, pide por escrito todos los costos y revisa duración del contrato, fechas de pago, cargos por atraso, reparaciones, mascotas, subarrendar, salida anticipada y renovación.",
      "Paga con métodos rastreables y guarda recibos. El día de mudanza toma fotos de paredes, pisos, electrodomésticos, puertas, ventanas, alarmas y daños existentes.",
    ],
  },
  "category-health": {
    title: "Guía básica de seguro médico en California",
    category: "Salud",
    tags: ["Seguro médico", "Covered California", "Medi-Cal", "Salud para recién llegados"],
    excerpt: "Compara seguro del empleador, Covered California, Medi-Cal y atención sin seguro antes de elegir plan.",
    body: [
      "Esta guía ayuda a recién llegados sin cobertura médica, familias que comparan opciones y personas que eligen un plan estadounidense por primera vez.",
      "Prepara información del hogar, dirección en California, SSN si aplica, documentos migratorios relevantes, ingresos, cobertura actual, médicos, hospitales, recetas y presupuesto.",
      "Revisa primero el seguro del empleador: fecha de inscripción, aporte del empleador, costo familiar y fecha efectiva. Covered California permite comparar planes y posibles subsidios.",
      "Medi-Cal es el programa Medicaid de California para residentes elegibles por ingresos y otros factores. Los resultados pueden variar por miembro de la familia.",
      "Compara costo total: prima, deducible, copagos, coseguro, máximo de bolsillo, red médica, hospitales, salud mental, farmacia y medicamentos.",
    ],
  },
  "guide-1": {
    title: "Cómo solicitar una licencia de conducir de California",
    category: "DMV",
    tags: ["Licencia de California", "DMV", "Examen escrito", "Examen de manejo", "Recién llegados"],
    excerpt: "Conoce documentos, citas, exámenes y pasos del DMV para solicitar tu primera licencia en California.",
    body: [
      "Esta guía ayuda a nuevos residentes, adultos que solicitan por primera vez una licencia en EE. UU. y personas con licencia extranjera o de otro estado.",
      "Lista de preparación: Documentos de identidad y presencia legal, comprobante de domicilio en California, información de SSN si aplica, licencias existentes, pago de tarifas, materiales de estudio, vehículo para examen práctico, registro válido, seguro válido.",
      "Elige el tipo correcto: licencia estándar, licencia REAL ID o AB 60. Cada una tiene requisitos y usos diferentes; AB 60 no sirve como REAL ID.",
      "Empieza con la solicitud en línea, luego visita el DMV para verificar documentos, tomar foto, huellas, pagar tarifas y completar exámenes.",
      "Estudia el California Driver's Handbook para el examen de visión y conocimiento. No dependas solo de preguntas de práctica no oficiales. Si no tienes una licencia que califique, es posible que primero necesites un permiso de instrucción para practicar.",
      "Antes de programar el examen práctico, confirma que el vehículo sea seguro y tenga registro y seguro válidos. Practica giros, estacionamiento, cambios de carril, observación del tráfico y control de velocidad. Después de aprobar, el DMV normalmente entrega una licencia temporal y envía la tarjeta oficial por correo.",
      "Errores comunes: elegir el tipo incorrecto de licencia, llevar copias en lugar de originales o documentos certificados, usar comprobantes de dirección que no coinciden, llegar al examen práctico con un vehículo sin seguro o registro válido, asumir que una licencia extranjera elimina los requisitos de examen de California, o mudarse después de aplicar sin actualizar la dirección postal.",
      "Recordatorio oficial: Los requisitos de licencia varían por edad, tipo de documento y categoría de licencia. Usa la lista de documentos del DMV de California y el Driver's Handbook más reciente antes de aplicar o tomar un examen.",
    ],
  },
  "guide-real-id-documents": {
    title: "Guía de documentos para REAL ID",
    category: "DMV",
    tags: ["REAL ID", "DMV California", "Identidad", "Comprobante de domicilio", "Identificación para vuelos"],
    excerpt: "Organiza identidad, SSN, domicilio en California y documentos de cambio de nombre antes de solicitar REAL ID.",
    body: [
      "Esta guía ayuda a residentes que solicitan REAL ID por primera vez o desean actualizar una licencia o identificación estándar.",
      "Prepara un documento de identidad aceptado, dos comprobantes de residencia en California, información de SSN o excepción aplicable, documentos de cambio de nombre y confirmación de solicitud en línea.",
      "Confirma si realmente necesitas REAL ID. No es necesario para manejar, pero una licencia estándar no cumple ciertos usos federales.",
      "Usa el checklist oficial del DMV. Los documentos deben mostrar nombre legal completo, fecha de nacimiento y dirección física de California cuando corresponda.",
      "Si los nombres no coinciden, lleva documentos oficiales que conecten los nombres, como certificado de matrimonio, divorcio o una orden judicial.",
    ],
  },
  "guide-2": {
    title: "Manual para rentar en California",
    category: "Vivienda",
    tags: ["Rentas en California", "Solicitud de renta", "Contrato", "Depósito", "Vivienda"],
    excerpt: "Guía práctica para presupuesto, visitas, solicitud, depósito, revisión del contrato y documentación de mudanza.",
    body: [
      "El presupuesto completo debe incluir renta, servicios, internet, estacionamiento, lavandería, transporte y seguro de inquilino.",
      "Revisa trabajo, escuelas, transporte público, estacionamiento y servicios del vecindario. No uses solo distancia en el mapa; prueba el viaje en horas pico.",
      "Prepara identificación, ingresos, fondos, referencias y explicación si no tienes historial crediticio en EE. UU.",
      "Antes de firmar, pide todos los cargos por escrito y revisa salida anticipada, renovación, reparaciones, visitas, mascotas, subarrendar y cargos por atraso.",
      "Al mudarte, toma fotos de paredes, pisos, electrodomésticos, ventanas, alarmas y daños existentes. Guarda contrato, inspección, pagos y mensajes con el arrendador.",
    ],
  },
  "guide-rental-scams": {
    title: "Estafas comunes de renta en California",
    category: "Vivienda",
    tags: ["Estafas de renta", "Falso arrendador", "Depósito", "Prevención"],
    excerpt: "Aprende a detectar anuncios falsos, arrendadores impostores, agentes falsos y solicitudes de pago sospechosas.",
  },
  "forum-first-30-days": {
    title: "Primeros 30 días en California",
    category: "Guía comunitaria",
    tags: ["Primeros 30 días", "Recién llegados", "Documentos", "Orden de trámites"],
    excerpt: "Muchos retrasos ocurren por hacer los trámites en el orden equivocado. Esta guía organiza el primer mes según qué paso desbloquea al siguiente.",
    body: [
      "A quién va dirigida: Personas que llegarán a California durante los próximos 30 días y personas que llegaron en los últimos 30 días. Esta guía explica el orden de los trámites sin repetir los requisitos detallados de cada guía temática.",
      "Qué desbloquea cada paso: Una dirección postal en Estados Unidos puede facilitar la apertura de una cuenta bancaria, una cita del DMV, la inscripción escolar y las cuentas de servicios. Un Social Security Number o ITIN puede ser necesario para la nómina y muchos productos de crédito. Para REAL ID generalmente se necesitan dos comprobantes de domicilio distintos. Empieza primero los trámites con filas de espera, porque ese tiempo no se puede acortar.",
      "Lista de preparación: Número de teléfono estadounidense, dirección postal disponible durante 30 días, copias digitales cifradas, originales de pasaporte y visa, registro I-94, expedientes escolares de los niños, depósito para abrir una cuenta bancaria",
      "Antes de llegar: Escanea el pasaporte, la visa, el registro I-94, el acta de nacimiento, el acta de matrimonio y cualquier aviso de aprobación migratoria. Guarda una copia digital cifrada y lleva los originales en el equipaje de mano, nunca en el equipaje facturado. Decide qué dirección postal usarás durante el primer mes. Si viajas con niños en edad escolar, solicita antes sus expedientes y registros de vacunación.",
      "Días 1 a 3, mantente localizable: Muchos pasos no pueden empezar hasta que una institución pueda comunicarse contigo. Obtén un número de teléfono estadounidense, porque algunas agencias y bancos no envían códigos a números internacionales. Confirma una dirección postal que conservarás al menos 30 días, porque reunir comprobantes de domicilio toma tiempo. Crea una carpeta física y otra digital para tus documentos. Omitir este paso puede retrasar varias tareas posteriores.",
      "Semana 1, inicia las esperas: Algunos trámites pueden tener periodos de espera que no se pueden acortar, así que comienza ahora aunque otros asuntos parezcan más urgentes. Reserva la cita de Social Security más temprana que permita tu situación. Abre una cuenta bancaria o, si todavía no tienes SSN, confirma primero qué instituciones aceptan pasaporte e ITIN.",
      "Semanas 2 y 3, usa tu dirección: Cuando el correo llegue a tu dirección, los documentos generados pueden desbloquear pasos posteriores. Solicita una licencia de conducir o identificación estatal y decide si necesitas REAL ID. Inscribe a los niños en el distrito correspondiente a tu domicilio. Investiga la cobertura médica, porque mudarte a California puede abrir un periodo especial de inscripción. Configura los servicios y el internet.",
      "Semana 4, detecta bloqueos: En vez de seguir marcando una lista, pregunta qué está esperando cada trámite pendiente. Una solicitud de REAL ID detenida puede significar que tienes un comprobante de domicilio en vez de dos. Una oferta de trabajo detenida puede depender de la autorización de empleo y no solo de la tarjeta del SSN. Los rechazos de vivienda pueden reflejar falta de historial crediticio en Estados Unidos y no falta de ingresos. Identifica el bloqueo antes de pedir ayuda.",
      "Seguridad durante el primer mes: California tiene riesgos que pueden ser nuevos para ti. Aprende qué hacer durante un terremoto y cómo funcionan las advertencias y órdenes de evacuación por incendios. Aprende que las protecciones salariales y de seguridad laboral de California se aplican sin importar el estatus migratorio. Aprende que un notario no es un abogado en Estados Unidos, porque esa confusión puede causar daños graves.",
      "Errores comunes: Abrir una cuenta bancaria antes de tener dirección o teléfono en Estados Unidos, reservar una cita del DMV antes de recibir correo que demuestre residencia, suponer que el Social Security Number por sí solo autoriza a trabajar, reunir un solo comprobante de domicilio antes de solicitar REAL ID, esperar una vivienda permanente antes de entrar en la fila de citas del SSN, pagar a alguien que afirma poder acelerar un trámite gubernamental",
      "Recordatorio oficial: Esta guía solo explica el orden de los trámites. Los requisitos, plazos y criterios dependen del estatus migratorio, el condado y la política vigente. Confirma cada paso en la guía temática correspondiente y en sus fuentes oficiales antes de actuar.",
    ],
  },
  "trending-ssn": {
    title: "Cómo solicitar un número de Seguro Social (SSN)",
    category: "Guía comunitaria",
    tags: ["SSN", "Seguro Social", "Solicitud", "Documentos"],
    excerpt: "Confirma la elegibilidad, elige la vía correcta, prepara documentos y encuentra ayuda del Seguro Social en cualquier lugar de Estados Unidos.",
    body: [
      "A quién ayuda: Personas que solicitan su primer número de Seguro Social, quienes necesitan reemplazar o corregir una tarjeta y no ciudadanos que deben entender cómo el estatus migratorio y la autorización de trabajo afectan la elegibilidad.",
      "Confirma primero la elegibilidad: Los ciudadanos estadounidenses y muchos no ciudadanos con autorización de trabajo del Departamento de Seguridad Nacional pueden solicitar un SSN. Una persona admitida legalmente sin autorización de trabajo generalmente necesita un motivo no laboral válido reconocido por la ley. La tarjeta de SSN por sí sola no autoriza a trabajar.",
      "Elige la vía correcta: Empieza con la herramienta oficial de Número y Tarjeta de SSA. Algunas personas pueden pedir un SSN al presentar un formulario elegible de inmigración o autorización de trabajo ante USCIS; otras pueden comenzar en línea y terminar el proceso con Social Security. No presentes otra solicitud si ya pediste el SSN mediante USCIS.",
      "Lista de preparación: Documento de identidad vigente, prueba de edad, evidencia de ciudadanía estadounidense o documentos actuales de inmigración y autorización de trabajo, información completa de la solicitud, confirmación de cita cuando corresponda, documentos originales o copias certificadas por la entidad emisora en lugar de fotocopias comunes o copias notarizadas",
      "Encuentra ayuda cercana: Usa el localizador oficial de oficinas de SSA con tu dirección o código postal. Los procedimientos y las citas pueden variar, así que confirma antes de viajar si el servicio puede hacerse en línea, por teléfono o requiere cita. Esta guía es nacional y no se limita a una ciudad de California.",
      "En la cita: Lleva los documentos que SSA indique para tu situación y reserva tiempo para la revisión de identidad y elegibilidad. Solicitar una tarjeta original o de reemplazo es gratis. Guarda el recibo o la confirmación y protege tu SSN y tus documentos.",
      "Después de solicitar: Vigila el correo en la dirección proporcionada y revisa tu nombre cuando llegue la tarjeta. Contacta directamente a SSA si no llega dentro del plazo indicado. Los reemplazos, correcciones de nombre y actualizaciones de estatus migratorio pueden seguir pasos distintos en línea o presenciales.",
      "Errores comunes: Suponer que el SSN demuestra autorización de trabajo, llevar solo fotocopias, pagar a un intermediario por un servicio gratuito, usar un número falso o ajeno, presentar solicitudes duplicadas, depender de informes no oficiales sobre citas o enviar documentos a una persona o sitio no verificado",
      "Recordatorio oficial: La elegibilidad y los documentos dependen de la ciudadanía, el estatus migratorio, la autorización de trabajo, la edad y el tipo de solicitud. Usa la herramienta de Número y Tarjeta de SSA para obtener una ruta personalizada y confirma las instrucciones vigentes directamente con Social Security.",
    ],
  },
  "guide-moving-address-checklist": {
    title: "Mudarte en California: todas las direcciones y cuentas que debes actualizar",
    category: "Vivienda",
    tags: ["Mudanza", "Cambio de domicilio", "USCIS", "DMV", "Lista"],
    excerpt: "Una lista por plazos para actualizar correo, registros públicos, seguros, bancos, servicios y otras cuentas esenciales al mudarte en California.",
    body: [
      "A quién va dirigida: Personas que cambian de domicilio dentro de California y residentes que entran o salen del estado. La guía separa obligaciones federales, plazos de California y actualizaciones de proveedores para resolver primero los registros urgentes.",
      "Tabla de plazos: Usa la lista siguiente como centro de control. Los plazos públicos se aplican solo cuando la agencia y la regla cubren tu situación; los tiempos de proveedores son orientación práctica y no plazos legales. Guarda cada confirmación hasta que el correo y las cuentas muestren el domicilio nuevo.",
      "Antes de mudarte: Solicita el reenvío de USPS en el sitio oficial o en una oficina postal, programa la baja y alta de servicios y actualiza a tu empleador o portal de nómina antes del siguiente ciclo de pago. El reenvío es una red de seguridad, no reemplaza avisar directamente a cada organización.",
      "Dentro de 10 días: La mayoría de los no ciudadanos debe informar su nueva dirección a USCIS dentro de 10 días, sujeto a las excepciones de USCIS. El reenvío de USPS no actualiza USCIS y USPS indica que no reenvía correo de USCIS. El DMV de California también exige actualizar la dirección dentro de 10 días. Revisa por separado la licencia o identificación y cada registro de vehículo, embarcación o placa, sin suponer que un cambio cubre todo. Los votantes elegibles deben confirmar su domicilio antes del plazo de la próxima elección.",
      "Dentro de dos semanas: Actualiza bancos, tarjetas, prestamistas, seguro de auto, seguro de inquilino, cobertura médica, proveedores de salud y la dirección para correspondencia fiscal. Informa al seguro dónde se guarda principalmente el vehículo; la ubicación se usa en registros y tarifas de auto en California. Usa el Formulario 8822 cuando necesites informar al IRS un cambio de domicilio postal.",
      "Servicios públicos y privados: Confirma electricidad, gas, agua, basura, internet, teléfono, seguridad, suscripciones, escuelas, cuidado infantil, licencias de mascotas, permisos de estacionamiento, peajes y perfiles de entrega. Registra lecturas finales cuando sea posible, devuelve equipos alquilados y revisa que no haya cobros superpuestos.",
      "Lo que quizá no necesitas: Por lo general no se cambia la dirección de la tarjeta del Seguro Social. Si recibes beneficios del Seguro Social o Medicare, actualiza el domicilio postal mediante el procedimiento de SSA. Quienes reciben SSI tienen reglas distintas y deben informar pronto cambios relevantes de domicilio o convivencia. Los teléfonos de seguridad de Login.gov o ID.me también pueden ser distintos de los datos de contacto de beneficios de SSA.",
      "Protégete durante la mudanza: Usa solo USPS.com para el reenvío; sitios de terceros pueden cobrar mucho más que la tarifa oficial de autenticación. Protege el correo, actualiza la dirección de facturación antes de compras grandes, usa contraseñas únicas y guarda capturas, recibos, números de caso y fechas efectivas. Ninguna actualización pública exige pago con tarjetas regalo o criptomonedas.",
      "Errores comunes: Tratar el reenvío de USPS como aviso a USCIS, actualizar la licencia del DMV pero no los vehículos, esperar hasta después de mudarte para programar servicios, olvidar el domicilio donde se guarda el auto, cambiar la dirección postal del banco pero no la de facturación, perder confirmaciones o suponer sin verificar que el registro electoral se actualizó",
      "Recordatorio oficial: Las reglas dependen del estatus migratorio, tipo de beneficio, dirección de la mudanza, calendario electoral y registros que tengas. Confirma los requisitos actuales con USPS, USCIS, DMV de California, SSA, IRS, la oficina electoral y cada proveedor antes de depender de esta lista.",
    ],
  },
  "trending-banking": {
    title: "Qué puedes preparar para abrir cuenta sin SSN",
    category: "Pregunta popular",
    tags: ["Sin SSN", "ITIN", "Cuenta bancaria", "Pasaporte", "Finanzas"],
    excerpt: "Prepara documentos alternativos, compara políticas bancarias y protege tus finanzas mientras esperas SSN.",
  },
  "guide-first-doctor-visit": {
    title: "Primera visita al médico en Estados Unidos",
    category: "Salud",
    tags: ["Médico en EE. UU.", "Atención primaria", "Cita médica", "Red de seguro", "Facturas médicas"],
    excerpt: "Encuentra médico, agenda cita, prepara la visita, maneja recetas y entiende facturas.",
  },
  "guide-legal-30-day-documents": {
    title: "Plan de documentos antes de mudarte a California",
    category: "Legal",
    tags: ["Documentos migratorios", "Preparación", "I-94", "Organización", "Mudanza a California"],
    excerpt: "Organiza documentos de identidad, ingreso, familia, salud, educación y finanzas antes de mudarte.",
  },
  "guide-newcomer-job-search": {
    title: "Checklist de búsqueda de empleo para recién llegados",
    category: "Empleo",
    tags: ["Empleo", "Currículum estadounidense", "Autorización de trabajo", "I-9", "California"],
    excerpt: "Confirma elegibilidad laboral, prepara un currículum estilo EE. UU., documentos y una búsqueda segura.",
  },
  "guide-school-esl-resources": {
    title: "Inscripción escolar y recursos ESL para niños",
    category: "Educación",
    tags: ["Inscripción escolar", "ESL", "English Learner", "Estudiantes recién llegados", "Distrito escolar"],
    excerpt: "Encuentra tu distrito, prepara documentos de inscripción y entiende apoyos para estudiantes aprendiendo inglés.",
  },
  "guide-california-transportation": {
    title: "Transporte, compra de auto y seguro en California",
    category: "Transporte",
    tags: ["Transporte en California", "Comprar auto", "Seguro de auto", "Registro vehicular", "Recién llegados"],
    excerpt: "Compara transporte público y costo de tener auto, y entiende compra, registro y seguro básico.",
  },
  "guide-earthquake-wildfire-preparedness": {
    title: "Preparación para terremotos e incendios en California",
    category: "Seguridad",
    tags: ["Terremoto", "Incendio", "Evacuación", "Mochila de emergencia", "Calidad del aire"],
    excerpt: "Activa alertas, prepara rutas de evacuación y una mochila, y protege a tu familia del humo.",
  },
  "guide-notario-fraud": {
    title: "Cómo evitar el fraude migratorio de notarios",
    category: "Legal",
    tags: ["Notario", "Fraude migratorio", "Ayuda legal", "Verificar abogado", "Servicios migratorios"],
    excerpt: "Identifica asesoría migratoria no autorizada y verifica abogados o representantes acreditados por DOJ.",
  },
  "guide-workers-rights-wage-theft": {
    title: "Derechos laborales y robo de salarios en California",
    category: "Empleo",
    tags: ["Derechos laborales", "Robo de salario", "Salario mínimo", "Horas extra", "Represalias"],
    excerpt: "Registra horas y pagos, identifica robo de salario y conoce las protecciones y reclamos de California.",
  },
};

function applyBodyTranslations(
  translations: Record<string, BlogArticleTranslation>,
  bodies: Record<string, string[]>,
) {
  return Object.fromEntries(
    Object.entries(translations).map(([id, translation]) => [
      id,
      bodies[id] ? { ...translation, body: bodies[id] } : translation,
    ]),
  ) as Record<string, BlogArticleTranslation>;
}

const alignedEnglishTranslations = applyBodyTranslations(englishTranslations, ENGLISH_BLOG_BODIES);

const spanishByEnglishFallback = (id: string): BlogArticleTranslation => {
  const source = alignedEnglishTranslations[id] ?? {};
  return {
    title: source.title,
    category: source.category,
    tags: source.tags,
    excerpt: source.excerpt,
    body: source.body,
  };
};

const SPANISH_EXTENSIONS: Record<string, BlogArticleTranslation> = Object.fromEntries(
  Object.keys(alignedEnglishTranslations)
    .filter((id) => !spanishTranslations[id])
    .map((id) => [id, spanishByEnglishFallback(id)]),
);

const alignedSpanishTranslations = applyBodyTranslations(
  { ...SPANISH_EXTENSIONS, ...spanishTranslations },
  SPANISH_BLOG_BODIES,
);

const translationByLanguage: Record<OfficialContentLanguage, Record<string, BlogArticleTranslation>> = {
  en: alignedEnglishTranslations,
  "zh-CN": zhCnPatches,
  "zh-TW": {},
  es: alignedSpanishTranslations,
};

export function getLocalizedBlogArticles(language: LanguageCode): BlogArticle[] {
  const contentLanguage = normalizeOfficialContentLanguage(language);
  return BLOG_ARTICLES.map((article) => localizeBlogArticle(article, contentLanguage));
}

export function getLocalizedBlogArticle(id: string, language: LanguageCode) {
  const article = getBlogArticle(id);
  if (!article) {
    return undefined;
  }

  return localizeBlogArticle(article, normalizeOfficialContentLanguage(language));
}

export function getRecommendedBlogArticles(language: LanguageCode) {
  return RECOMMENDED_ARTICLE_IDS
    .map((id) => getLocalizedBlogArticle(id, language))
    .filter((article): article is BlogArticle => Boolean(article));
}

export function searchLocalizedBlogArticles(language: LanguageCode, searchText: string) {
  const normalizedSearch = normalizeSearchText(searchText);

  if (!normalizedSearch) {
    return [];
  }

  return getLocalizedBlogArticles(language).filter((article) => {
    const citedSources = getGuideCitationSet(article.id, language)?.references ?? [];
    const searchableText = normalizeSearchText(
      [
        article.title,
        article.category,
        article.excerpt,
        article.tags.join(" "),
        article.body.join(" "),
        citedSources.map((reference) => `${reference.title} ${reference.purpose} ${reference.url}`).join(" "),
      ].join(" "),
    );

    return searchableText.includes(normalizedSearch);
  });
}

export function normalizeOfficialContentLanguage(language: LanguageCode): OfficialContentLanguage {
  if (language === "zh-TW" || language === "yue") {
    return "zh-TW";
  }
  if (language === "zh-CN" || language === "es") {
    return language;
  }
  return "en";
}

function localizeBlogArticle(article: BlogArticle, language: OfficialContentLanguage): BlogArticle {
  if (language === "zh-TW") {
    return toTraditionalArticle(localizeBlogArticle(article, "zh-CN"));
  }

  const translation = withDefaultBody(article, language, translationByLanguage[language][article.id]);

  return {
    ...article,
    ...translation,
  };
}

function normalizeSearchText(text: string) {
  return text
    .trim()
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function withDefaultBody(
  article: BlogArticle,
  language: OfficialContentLanguage,
  translation?: BlogArticleTranslation,
): BlogArticleTranslation | undefined {
  if (!translation) {
    return undefined;
  }

  if ((language === "en" || language === "es") && !translation.body?.length) {
    return {
      ...translation,
      body: buildDefaultBody(article, language, translation),
    };
  }

  return translation;
}

function buildDefaultBody(
  article: BlogArticle,
  language: Extract<OfficialContentLanguage, "en" | "es">,
  translation: BlogArticleTranslation,
) {
  const title = translation.title ?? article.title;
  const category = translation.category ?? article.category;

  if (language === "es") {
    return [
      `Esta guía resume los pasos principales para ${title.toLowerCase()} dentro del tema ${category}. Úsala como punto de partida práctico y confirma siempre los requisitos actuales en fuentes oficiales.`,
      "Antes de empezar, prepara documentos de identidad, comprobantes de domicilio, información financiera o médica relevante y cualquier número de caso, cita o registro que aplique a tu situación.",
      "Compara opciones, guarda copias de formularios y recibos, y toma notas de nombres, fechas, oficinas, costos y próximos pasos. Esto facilita resolver dudas si una agencia, banco, escuela o arrendador pide información adicional.",
      "Evita enviar documentos sensibles a personas no verificadas, pagar con métodos difíciles de rastrear o confiar solo en consejos de redes sociales. Cuando el tema sea legal, médico o financiero, confirma con la institución oficial o un profesional calificado.",
    ];
  }

  return [
    `This guide summarizes the main steps for ${title.toLowerCase()} in the ${category} area. Use it as a practical starting point and confirm current requirements with official sources before acting.`,
    "Before you begin, organize identity documents, address proof, financial or medical information, and any case numbers, appointments, or records that apply to your situation.",
    "Compare options, keep copies of forms and receipts, and record names, dates, offices, fees, and next steps. This makes follow-up easier if an agency, bank, school, landlord, or provider asks for more information.",
    "Avoid sending sensitive documents to unverified people, paying through hard-to-trace methods, or relying only on social media advice. For legal, medical, or financial topics, confirm with the official institution or a qualified professional.",
  ];
}

function toTraditionalArticle(article: BlogArticle): BlogArticle {
  return {
    ...article,
    title: toTraditional(article.title),
    category: toTraditional(article.category),
    readTime: toTraditional(article.readTime),
    tags: article.tags.map(toTraditional),
    excerpt: toTraditional(article.excerpt),
    body: article.body.map(toTraditional),
  };
}

const traditionalReplacements: Array<[RegExp, string]> = [
  [/新移民/g, "新移民"],
  [/加州/g, "加州"],
  [/驾照/g, "駕照"],
  [/申请/g, "申請"],
  [/材料/g, "文件"],
  [/准备/g, "準備"],
  [/身份证明/g, "身分證明"],
  [/身份证/g, "身分證"],
  [/地址/g, "地址"],
  [/证明/g, "證明"],
  [/银行/g, "銀行"],
  [/账户/g, "帳戶"],
  [/开户/g, "開戶"],
  [/储蓄/g, "儲蓄"],
  [/费用/g, "費用"],
  [/医疗/g, "醫療"],
  [/保险/g, "保險"],
  [/家庭/g, "家庭"],
  [/学校/g, "學校"],
  [/学习/g, "學習"],
  [/记录/g, "紀錄"],
  [/联系/g, "聯絡"],
  [/预约/g, "預約"],
  [/执照/g, "執照"],
  [/车辆/g, "車輛"],
  [/登记/g, "登記"],
  [/确认/g, "確認"],
  [/官方网站/g, "官方網站"],
  [/网站/g, "網站"],
  [/信息/g, "資訊"],
  [/电子/g, "電子"],
  [/发送/g, "傳送"],
  [/论坛/g, "論壇"],
  [/社区/g, "社群"],
  [/问题/g, "問題"],
  [/常见/g, "常見"],
  [/错误/g, "錯誤"],
  [/提醒/g, "提醒"],
  [/选择/g, "選擇"],
  [/适合/g, "適合"],
  [/类别/g, "類別"],
  [/时间/g, "時間"],
  [/后/g, "後"],
  [/与/g, "與"],
  [/为/g, "為"],
  [/个/g, "個"],
  [/这/g, "這"],
  [/时/g, "時"],
  [/会/g, "會"],
  [/应/g, "應"],
  [/从/g, "從"],
  [/发/g, "發"],
  [/长/g, "長"],
  [/无/g, "無"],
  [/汉/g, "漢"],
  [/简/g, "簡"],
];

function toTraditional(value: string) {
  return traditionalReplacements.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), value);
}
