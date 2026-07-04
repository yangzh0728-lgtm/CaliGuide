import type { LanguageCode } from "../i18n/translations";
import { BLOG_ARTICLES, BlogArticle, OfficialLink, getBlogArticle } from "./blogContent";

export type OfficialContentLanguage = "en" | "zh-CN" | "zh-TW" | "es";

type BlogArticleTranslation = Partial<
  Pick<BlogArticle, "title" | "category" | "readTime" | "tags" | "excerpt" | "body">
> & {
  officialLinks?: Array<Partial<OfficialLink> & Pick<OfficialLink, "url">>;
};

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
];

const zhCnPatches: Record<string, BlogArticleTranslation> = {
  "category-dmv": {
    title: "新居民加州 DMV 办事清单",
    tags: ["DMV", "驾照", "REAL ID", "加州"],
    excerpt: "帮助新居民规划最常见的 DMV 事项，包括驾照、REAL ID、车辆登记和地址更新。",
    body: [
      "先确认你最需要办理的 DMV 事项：加州驾照、州身份证、REAL ID、车辆登记或地址更新。新居民应查看官方 DMV 时间要求，因为截止日期可能取决于何时建立加州居民身份，以及是否从外州带车进入加州。",
      "预约前整理身份、住址和合法居留相关材料。常见材料包括护照或其他身份证明、加州住址证明、适用时的 Social Security 信息，以及已有的外州驾照或车辆登记。",
      "访问 DMV 官网确认表格、费用、考试要求和预约情况。许多步骤可以在线开始，但到现场前仍应用官方页面核对最新规则。",
      "办理后保存收据、临时文件、考试结果和续期提醒。正式驾照或 REAL ID 邮寄到家后，应立即核对姓名和地址是否正确。",
    ],
  },
  "forum-first-30-days": {
    title: "到加州前 30 天社区指南",
    category: "社区指南",
    tags: ["前 30 天", "新居民", "文件", "社区"],
    excerpt: "按周整理证件、住房、交通、银行、医疗和本地生活设置。",
    body: [
      "第一周先稳定联系方式：本地电话号码、可正常登录的邮箱、临时或长期住址、重要文件扫描件，以及保存收据和预约确认的文件夹。",
      "第一到第二周处理住房、水电网络、银行、交通规划和医疗保险研究。如果需要 DMV、SSN、学校或福利预约，应尽早查看官方网站，因为预约余量变化很快。",
      "第三周建立本地生活节奏：超市、药房、家庭医生、通勤路线、学校或工作入职，以及紧急联系人。保存附近诊所、公共交通和城市资源的地址及电话。",
      "第四周回顾仍未完成的事项，并在社区里提出具体问题。好的论坛提问应包含所在城市、时间线、已准备文件和正在做的决定。",
    ],
  },
  "trending-ssn": {
    title: "San Jose SSN 预约和材料准备",
    category: "热门问题",
    tags: ["SSN", "预约", "San Jose", "材料"],
    excerpt: "了解如何准备 SSN 办理材料，以及预约紧张时可以确认哪些替代安排。",
    body: [
      "预约情况可能快速变化，所以制定计划前应先查看 Social Security Administration 官网和当地办公室说明。San Jose 用户也可以在交通可行时比较附近办公室。",
      "根据个人情况准备身份、移民、工作授权、学校或雇佣文件。需要原件时应携带原件，并为自己保留副本。",
      "如果预约有限，可以询问办公室是否接受 walk-in、是否可重新安排时间，以及附近其他办公室是否可以办理。不要只依赖社区经验，因为政策和等待时间会变化。",
      "办理后保存收据或确认信息，并留意邮件送达。如果卡片未在预计时间内寄到，应直接联系 SSA 获取下一步说明。",
    ],
  },
};

const englishTranslations: Record<string, BlogArticleTranslation> = {
  "category-dmv": {
    title: "DMV Checklist for New California Residents",
    category: "DMV",
    tags: ["DMV", "Driver License", "REAL ID", "California"],
    excerpt: "Plan your first DMV tasks, including licenses, REAL ID documents, vehicle registration, and address updates.",
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
      "Prepare identity and legal-presence documents, California address proof, SSN information if applicable, existing licenses, fee payment, study materials, and a road-test vehicle with valid registration and insurance.",
      "Choose the correct license type before applying. A standard license, REAL ID license, and AB 60 license have different document rules and uses; AB 60 cannot be used as REAL ID.",
      "Start the online driver's license or ID application, then visit DMV to verify documents, take a photo, provide fingerprints, pay fees, and complete required tests.",
      "Study the latest California Driver's Handbook for the vision and knowledge tests. Before a road test, make sure the vehicle is safe, registered, insured, and that you have practiced turns, lane changes, parking, observation, and speed control.",
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
    title: "First 30 Days in California Community Guide",
    category: "Community Guide",
    tags: ["First 30 Days", "Newcomer", "Documents", "Community"],
    excerpt: "A week-by-week setup outline for documents, housing, transportation, banking, healthcare, and local routines.",
  },
  "trending-ssn": {
    title: "SSN Appointment and Document Prep in San Jose",
    category: "Trending Question",
    tags: ["SSN", "Appointments", "San Jose", "Documents"],
    excerpt: "Prepare for an SSN visit and understand what to check when local appointments are limited.",
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
};

const spanishTranslations: Record<string, BlogArticleTranslation> = {
  "category-dmv": {
    title: "Lista del DMV para nuevos residentes de California",
    category: "DMV",
    tags: ["DMV", "Licencia de conducir", "REAL ID", "California"],
    excerpt: "Planifica tus primeros trámites del DMV: licencia, REAL ID, registro del vehículo y cambio de dirección.",
    body: [
      "Primero decide qué trámite necesitas: licencia de California, identificación estatal, REAL ID, registro del vehículo o cambio de dirección.",
      "Prepara documentos de identidad, residencia y presencia legal antes de pedir cita. También lleva cualquier licencia o registro de otro estado si aplica.",
      "Usa el sitio oficial del DMV para confirmar formularios, costos, exámenes y citas. Muchas gestiones empiezan en línea, pero las reglas actuales deben verificarse en la fuente oficial.",
      "Después de la visita, guarda recibos, documentos temporales, resultados de exámenes y recordatorios. Cuando llegue la tarjeta, revisa nombre y dirección.",
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
      "Prepara documentos de identidad y presencia legal, comprobantes de domicilio en California, información de SSN si aplica, licencias existentes, pago de tarifa y materiales de estudio.",
      "Elige el tipo correcto: licencia estándar, licencia REAL ID o AB 60. Cada una tiene requisitos y usos diferentes; AB 60 no sirve como REAL ID.",
      "Empieza con la solicitud en línea, luego visita el DMV para verificar documentos, tomar foto, huellas, pagar tarifas y completar exámenes.",
      "Estudia el California Driver's Handbook. Para el examen de manejo, el vehículo debe estar seguro, registrado, asegurado y listo para demostrar giros, cambios de carril, estacionamiento, observación y control de velocidad.",
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
    title: "Guía comunitaria de los primeros 30 días en California",
    category: "Guía comunitaria",
    tags: ["Primeros 30 días", "Recién llegados", "Documentos", "Comunidad"],
    excerpt: "Plan semanal para documentos, vivienda, transporte, banca, salud y rutinas locales.",
    body: [
      "En la primera semana, estabiliza contacto: teléfono local, correo, dirección temporal o permanente, copias de documentos y carpeta para recibos y citas.",
      "En las primeras dos semanas, atiende vivienda, servicios, banca, transporte y seguro médico. Revisa temprano sitios oficiales para DMV, SSN, escuela o beneficios.",
      "En la tercera semana, crea rutinas: supermercado, farmacia, médico primario, rutas de transporte, escuela o trabajo y contactos de emergencia.",
      "En la cuarta semana, revisa pendientes y pregunta en la comunidad con ciudad, fechas, documentos preparados y la decisión que necesitas tomar.",
    ],
  },
  "trending-ssn": {
    title: "Cita de SSN y preparación de documentos en San José",
    category: "Pregunta popular",
    tags: ["SSN", "Citas", "San José", "Documentos"],
    excerpt: "Prepárate para una visita de SSN y revisa opciones cuando las citas locales son limitadas.",
    body: [
      "La disponibilidad de citas cambia rápido. Revisa SSA y la oficina local antes de planear.",
      "Prepara documentos de identidad, inmigración, autorización de trabajo, escuela o empleo según tu caso.",
      "Si hay pocas citas, pregunta sobre walk-in, reprogramación y oficinas cercanas. No dependas solo de reportes de la comunidad.",
      "Después de la cita, guarda confirmaciones y revisa el correo. Si la tarjeta no llega, contacta directamente a SSA.",
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
};

const spanishByEnglishFallback = (id: string): BlogArticleTranslation => {
  const source = englishTranslations[id] ?? {};
  return {
    title: source.title,
    category: source.category,
    tags: source.tags,
    excerpt: source.excerpt,
    body: source.body,
  };
};

const SPANISH_EXTENSIONS: Record<string, BlogArticleTranslation> = Object.fromEntries(
  Object.keys(englishTranslations)
    .filter((id) => !spanishTranslations[id])
    .map((id) => [id, spanishByEnglishFallback(id)]),
);

const translationByLanguage: Record<OfficialContentLanguage, Record<string, BlogArticleTranslation>> = {
  en: englishTranslations,
  "zh-CN": zhCnPatches,
  "zh-TW": {},
  es: { ...SPANISH_EXTENSIONS, ...spanishTranslations },
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
  const mergedLinks = mergeOfficialLinks(article.officialLinks, translation?.officialLinks);

  return {
    ...article,
    ...translation,
    officialLinks: localizeOfficialLinks(mergedLinks, language),
  };
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

function mergeOfficialLinks(sourceLinks?: OfficialLink[], translatedLinks?: BlogArticleTranslation["officialLinks"]) {
  if (!sourceLinks?.length) {
    return undefined;
  }

  if (!translatedLinks?.length) {
    return sourceLinks;
  }

  return sourceLinks.map((link) => {
    const translation = translatedLinks.find((item) => item.url === link.url);
    return {
      ...link,
      ...translation,
    };
  });
}

function localizeOfficialLinks(links: OfficialLink[] | undefined, language: OfficialContentLanguage) {
  if (!links?.length) {
    return undefined;
  }

  if (language === "en") {
    return links.map((link) => ({
      ...link,
      purpose: hasCjk(link.purpose) ? `Official reference for ${link.title}.` : link.purpose,
    }));
  }

  if (language === "es") {
    return links.map((link) => ({
      ...link,
      purpose: `Referencia oficial para ${link.title}.`,
    }));
  }

  return links;
}

function hasCjk(value: string) {
  return /[\u3400-\u9fff]/.test(value);
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
    officialLinks: article.officialLinks?.map((link) => ({
      ...link,
      title: toTraditional(link.title),
      purpose: toTraditional(link.purpose),
    })),
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
