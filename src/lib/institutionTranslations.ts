export interface InstitutionTranslationSeed {
  purpose: string;
  doesNotDo: string;
  scamWarning?: string;
}

export interface ConfusionTranslationSeed {
  trigger: string;
  explanation: string;
}

type LocalizedSeed<T> = {
  "zh-CN": T;
  es: T;
};

export const INSTITUTION_TRANSLATIONS: Record<
  string,
  LocalizedSeed<InstitutionTranslationSeed>
> = {
  uscis: {
    "zh-CN": {
      purpose: "处理多种移民福利申请，包括身份、工作许可、永久居留和入籍申请。",
      doesNotDo: "不签发美国驻外使领馆的签证，不裁决移民法庭案件，也不提供个人法律代理。",
    },
    es: {
      purpose: "Tramita solicitudes de beneficios migratorios, incluidas las de estatus, autorización de empleo, residencia permanente y naturalización.",
      doesNotDo: "No emite visas en embajadas estadounidenses, no decide casos de la corte de inmigración ni ofrece representación legal personal.",
    },
  },
  cbp: {
    "zh-CN": {
      purpose: "管理美国入境口岸、边境检查、入境记录，以及电子 I-94 等旅客工具。",
      doesNotDo: "不裁决大多数向 USCIS 提交的移民福利申请，也不在移民事务中代理旅客。",
    },
    es: {
      purpose: "Administra los puertos de entrada, las inspecciones fronterizas, los registros de admisión y herramientas para viajeros como el I-94 electrónico.",
      doesNotDo: "No decide la mayoría de las solicitudes de beneficios migratorios presentadas ante USCIS ni representa a viajeros en asuntos migratorios.",
    },
  },
  "us-doj": {
    "zh-CN": {
      purpose: "通过 EOIR 管理移民法庭和上诉系统，并认可相关机构和获得认证的移民代表。",
      doesNotDo: "不会替个人提交移民申请或提供政府律师；notario 也不能代表个人出席 EOIR 程序。",
      scamWarning: "请通过 justice.gov 官方资源核实律师和认证代表。公证员或移民顾问并不会自动获得提供法律意见的资格。",
    },
    es: {
      purpose: "Por medio de EOIR, administra los tribunales de inmigración y las apelaciones, y reconoce organizaciones y representantes acreditados.",
      doesNotDo: "No presenta solicitudes migratorias por una persona ni le proporciona un abogado del gobierno; los notarios no pueden representarla ante EOIR.",
      scamWarning: "Verifique abogados y representantes acreditados mediante recursos oficiales de justice.gov. Un notario o consultor migratorio no está automáticamente autorizado para dar asesoría legal.",
    },
  },
  "ca-dmv": {
    "zh-CN": {
      purpose: "签发加州驾驶执照和身份证，并办理车辆登记、产权、考试及相关记录。",
      doesNotDo: "不签发社会安全号码，不授予移民身份，也不批准在美国工作。",
    },
    es: {
      purpose: "Emite licencias de conducir y tarjetas de identificación de California y administra registros, títulos y pruebas de vehículos.",
      doesNotDo: "No emite números de Seguro Social, no concede estatus migratorio ni autoriza empleo en Estados Unidos.",
    },
  },
  ssa: {
    "zh-CN": {
      purpose: "管理 Social Security 项目，并签发 Social Security Number、补发卡和更正后的 Social Security 卡。",
      doesNotDo: "不授予移民身份、不签发工作许可、不征收联邦所得税，也不签发加州身份证。",
    },
    es: {
      purpose: "Administra los programas del Seguro Social y emite números, tarjetas de reemplazo y tarjetas corregidas del Seguro Social.",
      doesNotDo: "No concede estatus migratorio, no emite autorización de empleo, no recauda impuestos federales ni emite identificaciones de California.",
    },
  },
  usps: {
    "zh-CN": {
      purpose: "投递美国邮件，并为搬家人士提供官方地址变更和邮件转寄服务。",
      doesNotDo: "USPS 转寄不会更新 USCIS、DMV、银行、保险公司或其他机构，部分政府邮件也可能不会转寄。",
      scamWarning: "请通过 USPS.com 或邮局办理地址变更。非关联网站可能收取高得多的费用，也不能代你更新其他机构。",
    },
    es: {
      purpose: "Entrega correo en Estados Unidos y ofrece el cambio de domicilio y reenvío oficial cuando una persona se muda.",
      doesNotDo: "El reenvío de USPS no actualiza USCIS, DMV, bancos, aseguradoras ni otras organizaciones, y parte del correo oficial puede no reenviarse.",
      scamWarning: "Use USPS.com o una oficina postal para cambiar su domicilio. Los sitios no afiliados pueden cobrar mucho más y no pueden actualizar otras agencias por usted.",
    },
  },
  irs: {
    "zh-CN": {
      purpose: "执行联邦税法、接收联邦报税表，并为联邦税务用途签发个人纳税人识别号码（ITIN）。",
      doesNotDo: "ITIN 不提供移民身份、工作许可或 Social Security 福利，也不能替代税务系统以外要求的身份证明。",
    },
    es: {
      purpose: "Administra la ley tributaria federal, recibe declaraciones de impuestos y emite ITIN para fines tributarios federales.",
      doesNotDo: "Un ITIN no concede estatus migratorio, autorización de empleo ni beneficios del Seguro Social, y no sustituye la identificación fuera del sistema tributario federal.",
    },
  },
  fdic: {
    "zh-CN": {
      purpose: "为 FDIC 承保银行的合格存款提供保险，并提供查询银行保险状态和了解银行账户的工具。",
      doesNotDo: "不承保股票、债券、共同基金、加密资产等投资，也不承保非 FDIC 承保机构持有的存款。",
    },
    es: {
      purpose: "Asegura depósitos elegibles en bancos asegurados por la FDIC y ofrece herramientas para verificar la cobertura y aprender sobre cuentas bancarias.",
      doesNotDo: "No asegura inversiones como acciones, bonos, fondos mutuos o criptoactivos, ni depósitos en instituciones que no estén aseguradas por la FDIC.",
    },
  },
  cfpb: {
    "zh-CN": {
      purpose: "实施和执行联邦消费者金融法律，并受理有关金融产品和服务的投诉。",
      doesNotDo: "不担任个人的私人律师，不保证投诉结果，也不为银行存款提供保险。",
    },
    es: {
      purpose: "Aplica las leyes federales de protección financiera del consumidor y recibe quejas sobre productos y servicios financieros.",
      doesNotDo: "No actúa como abogado privado, no garantiza el resultado de una queja ni asegura depósitos bancarios.",
    },
  },
  ftc: {
    "zh-CN": {
      purpose: "保护消费者免受不公平或欺骗性行为，并运营联邦欺诈和身份盗用举报资源。",
      doesNotDo: "不保证解决每一份举报或按要求追回款项，遇到紧急危险时也不能替代联系当地警方。",
    },
    es: {
      purpose: "Protege a los consumidores de prácticas injustas o engañosas y administra recursos federales para denunciar fraude y robo de identidad.",
      doesNotDo: "No resuelve necesariamente cada denuncia, no recupera dinero a pedido ni sustituye a la policía local durante una emergencia inmediata.",
    },
  },
  "ca-insurance": {
    "zh-CN": {
      purpose: "监管加州保险行业、许可保险专业人员、提供消费者说明，并受理保险相关投诉。",
      doesNotDo: "不销售保险、不替消费者选择保单，也不能替代紧急医疗、警方或道路救援服务。",
    },
    es: {
      purpose: "Regula los seguros en California, autoriza a profesionales, ofrece orientación al consumidor y recibe quejas relacionadas con seguros.",
      doesNotDo: "No vende seguros, no elige una póliza por el consumidor ni sustituye servicios médicos, policiales o de asistencia vial de emergencia.",
    },
  },
  "ca-edd": {
    "zh-CN": {
      purpose: "管理失业、残障和带薪家庭假项目，并提供就业、培训、工资税和劳动力市场服务。",
      doesNotDo: "不裁决工资盗窃申诉、不执行用餐休息规定、不签发工作许可，也不保证任何人符合福利资格。",
    },
    es: {
      purpose: "Administra desempleo, discapacidad y Permiso Familiar Pagado, y ofrece servicios de empleo, capacitación, impuestos de nómina y mercado laboral.",
      doesNotDo: "No decide reclamos por robo de salario, no hace cumplir las pausas para comer, no emite permisos de trabajo ni garantiza elegibilidad para beneficios.",
    },
  },
  "ca-dir": {
    "zh-CN": {
      purpose: "通过劳动标准、职业安全、工伤赔偿和学徒培训项目监督加州工作场所保护。",
      doesNotDo: "不替求职者找工作、不签发移民文件，遇到工作场所紧急危险时也不能替代紧急服务。",
    },
    es: {
      purpose: "Supervisa las protecciones laborales de California mediante programas de normas laborales, seguridad ocupacional, compensación laboral y aprendizaje.",
      doesNotDo: "No encuentra empleo para solicitantes, no emite documentos migratorios ni sustituye los servicios de emergencia ante un peligro laboral inmediato.",
    },
  },
  "ca-labor-commissioner": {
    "zh-CN": {
      purpose: "执行多项加州劳动标准，并受理工资申诉、报复举报和其他劳动法违规报告。",
      doesNotDo: "不处理所有就业纠纷、不提供私人法律代理，也不裁决联邦移民身份。",
    },
    es: {
      purpose: "Hace cumplir muchas normas laborales de California y recibe reclamos salariales y denuncias de represalias y otras infracciones laborales.",
      doesNotDo: "No maneja todas las disputas laborales, no ofrece representación legal privada ni decide el estatus migratorio federal.",
    },
  },
  "covered-california": {
    "zh-CN": {
      purpose: "运营加州健康保险市场，并评估申请人是否可能获得保费补助或符合 Medi-Cal 资格。",
      doesNotDo: "不提供医疗服务、不能替代医生或急诊室，也不保证每位申请人都能获得经济补助。",
    },
    es: {
      purpose: "Opera el mercado de seguros médicos de California y evalúa la posible ayuda económica y elegibilidad para Medi-Cal.",
      doesNotDo: "No presta atención médica, no sustituye a un médico o sala de emergencias ni garantiza ayuda financiera para todos los solicitantes.",
    },
  },
  "ca-public-health": {
    "zh-CN": {
      purpose: "领导全州公共卫生项目、健康指引、疾病监测、许可职能和公共卫生紧急协调。",
      doesNotDo: "不提供日常个人医疗、不替个人选择健康保险，遇到危及生命的紧急情况时也不能替代 911。",
    },
    es: {
      purpose: "Dirige programas estatales de salud pública, orientación sanitaria, vigilancia de enfermedades, licencias y coordinación de emergencias de salud pública.",
      doesNotDo: "No presta atención médica personal rutinaria, no elige un plan de salud ni sustituye al 911 ante una emergencia potencialmente mortal.",
    },
  },
  epa: {
    "zh-CN": {
      purpose: "保护人类健康和环境，并发布有关空气质量、烟雾、污染和环境规则的全国信息与工具。",
      doesNotDo: "不发布当地疏散命令、不提供医疗诊断，也不能替代当地空气管理机构和应急部门。",
    },
    es: {
      purpose: "Protege la salud humana y el ambiente y publica información nacional sobre calidad del aire, humo, contaminación y normas ambientales.",
      doesNotDo: "No emite órdenes locales de evacuación, no diagnostica enfermedades ni sustituye a los distritos locales de aire y autoridades de emergencia.",
    },
  },
  "ca-real-estate": {
    "zh-CN": {
      purpose: "许可和监管加州房地产专业人员，并提供执照查询、教育、执法和消费者信息。",
      doesNotDo: "不担任租客律师、不裁决房东与租客案件，也不保证房源或交易真实可靠。",
    },
    es: {
      purpose: "Autoriza y regula a profesionales inmobiliarios de California y ofrece consulta de licencias, educación, cumplimiento e información al consumidor.",
      doesNotDo: "No actúa como abogado del inquilino, no decide casos entre propietarios e inquilinos ni garantiza que un anuncio o transacción sea legítimo.",
    },
  },
  "ca-doj": {
    "zh-CN": {
      purpose: "执行加州法律、保护消费者和公民权利，并提供公共指引、举报和查询资源。",
      doesNotDo: "不提供私人法律代理、不裁决民事案件，紧急情况下也不能替代 911 和当地警方。",
    },
    es: {
      purpose: "Hace cumplir la ley de California, protege a consumidores y derechos civiles, y ofrece orientación pública y recursos de denuncia y consulta.",
      doesNotDo: "No ofrece representación legal privada, no decide casos civiles ni sustituye al 911 y a la policía local durante una emergencia.",
    },
  },
  "ca-courts": {
    "zh-CN": {
      purpose: "提供法院信息、表格、提交说明和自助资源，涵盖住房、家庭、金钱及其他民事案件。",
      doesNotDo: "法院自助服务提供的是法律信息而非法律意见，也不会代理案件中的任何一方。",
    },
    es: {
      purpose: "Ofrece información judicial, formularios, instrucciones de presentación y recursos de autoayuda para asuntos de vivienda, familia, dinero y casos civiles.",
      doesNotDo: "La autoayuda judicial ofrece información legal, no asesoría legal, y no representa a ninguna de las partes.",
    },
  },
  "ca-education": {
    "zh-CN": {
      purpose: "监督加州公立学校系统，并发布全州指引、项目信息、学校数据和教育资源。",
      doesNotDo: "不直接为学生办理入学或分配社区学校；家庭通常需要联系当地学区。",
    },
    es: {
      purpose: "Supervisa el sistema de escuelas públicas de California y publica orientación estatal, información de programas, datos escolares y recursos educativos.",
      doesNotDo: "No inscribe directamente a estudiantes ni asigna escuelas de vecindario; las familias normalmente deben trabajar con su distrito escolar local.",
    },
  },
  "ca-oes": {
    "zh-CN": {
      purpose: "协调全州应急准备、响应、恢复、警报，以及州、地方、联邦和社区合作伙伴之间的支援。",
      doesNotDo: "遇到紧急情况时，不能替代 911、当地疏散指示、县级紧急警报或第一响应人员。",
    },
    es: {
      purpose: "Coordina la preparación, respuesta, recuperación y alertas de emergencia entre socios estatales, locales, federales y comunitarios.",
      doesNotDo: "No sustituye al 911, las instrucciones locales de evacuación, las alertas del condado ni a los socorristas durante una emergencia inmediata.",
    },
  },
  "cal-fire": {
    "zh-CN": {
      purpose: "提供消防和防火服务、山火信息、事故资源、可防御空间指引及自然资源管理。",
      doesNotDo: "发生火灾或其他紧急危险时，不能替代 911、当地疏散命令或县级警报系统。",
    },
    es: {
      purpose: "Ofrece protección y prevención contra incendios, información sobre incendios forestales, recursos de incidentes y orientación sobre espacios defendibles.",
      doesNotDo: "No sustituye al 911, las órdenes locales de evacuación ni los sistemas de alerta del condado durante un incendio u otro peligro inmediato.",
    },
  },
  "ca-211": {
    "zh-CN": {
      purpose: "通过 211 电话和在线资源目录，帮助人们联系当地食物、住房、健康、灾害及其他社区服务。",
      doesNotDo: "211 不是 911；当有人面临即时危险或危及生命的情况时，不应以 211 代替紧急调度。",
    },
    es: {
      purpose: "Conecta a las personas con servicios locales de alimentos, vivienda, salud, desastres y otros recursos comunitarios por teléfono y directorio en línea.",
      doesNotDo: "No es el 911 y no debe usarse en lugar del despacho de emergencias cuando alguien enfrenta peligro inmediato o una condición potencialmente mortal.",
    },
  },
  "bay-area-511": {
    "zh-CN": {
      purpose: "运营旧金山湾区 511 出行信息服务，提供公共交通、路况、骑行、拼车和行程规划信息。",
      doesNotDo: "不运营所有公共交通机构、不制定所有票价、不签发驾照，也不提供全加州交通信息。",
    },
    es: {
      purpose: "Opera el servicio 511 del Área de la Bahía para información de transporte público, tráfico, bicicleta, viajes compartidos y planificación de rutas.",
      doesNotDo: "No opera todas las agencias de transporte, no fija todas las tarifas, no emite licencias de conducir ni ofrece información para todo California.",
    },
  },
  "southern-california-511": {
    "zh-CN": {
      purpose: "提供南加州出行信息，包括路况、公共交通连接、道路事故和区域行程工具。",
      doesNotDo: "不运营所有当地公共交通服务、不制定所有票价、不签发驾照，也不提供紧急调度。",
    },
    es: {
      purpose: "Ofrece información para viajeros del sur de California, incluidas condiciones de tráfico, conexiones de transporte, incidentes viales y herramientas regionales.",
      doesNotDo: "No opera todos los servicios locales, no fija todas las tarifas, no emite licencias ni ofrece despacho de emergencias.",
    },
  },
  "ca-state-services": {
    "zh-CN": {
      purpose: "提供加州官方全州门户，用于查找机构、福利、服务、警报、表格和政府信息。",
      doesNotDo: "门户本身不裁决所有申请或直接提供所有服务；具体事项由相应州或地方机构处理。",
    },
    es: {
      purpose: "Ofrece el portal oficial estatal para encontrar agencias, beneficios, servicios, alertas, formularios e información del gobierno de California.",
      doesNotDo: "El portal no decide cada solicitud ni presta cada servicio; la agencia estatal o local responsable maneja el trámite.",
    },
  },
};

export const CONFUSION_TRANSLATIONS: Record<
  string,
  LocalizedSeed<ConfusionTranslationSeed>
> = {
  "uscis:cbp": {
    "zh-CN": {
      trigger: "你是在入境口岸，还是需要查询 I-94？",
      explanation: "CBP 负责边境检查、入境口岸和 I-94 等入境记录。",
    },
    es: {
      trigger: "¿Está en un puerto de entrada o busca su I-94?",
      explanation: "CBP maneja inspecciones fronterizas, puertos de entrada y registros de admisión como el I-94.",
    },
  },
  "uscis:us-doj": {
    "zh-CN": {
      trigger: "需要移民法庭或认证代表？",
      explanation: "司法部管理移民法庭并认可认证代表；USCIS 不提供个人法律代理。",
    },
    es: {
      trigger: "¿Necesita un tribunal de inmigración o representante acreditado?",
      explanation: "El Departamento de Justicia administra los tribunales de inmigración y reconoce representantes acreditados; USCIS no ofrece representación legal personal.",
    },
  },
  "cbp:uscis": {
    "zh-CN": {
      trigger: "要申请身份、工作许可或入籍？",
      explanation: "USCIS 处理入境后的大多数移民福利申请；CBP 负责边境检查和入境记录。",
    },
    es: {
      trigger: "¿Solicita estatus, autorización de empleo o ciudadanía?",
      explanation: "USCIS tramita la mayoría de los beneficios migratorios después de la entrada; CBP administra la inspección fronteriza y los registros de admisión.",
    },
  },
  "ca-dmv:ssa": {
    "zh-CN": {
      trigger: "需要 Social Security Number 或卡片？",
      explanation: "SSA 签发 Social Security Number 和卡片；DMV 签发加州驾照和身份证。",
    },
    es: {
      trigger: "¿Necesita un número o tarjeta del Seguro Social?",
      explanation: "SSA emite números y tarjetas del Seguro Social; DMV emite licencias de conducir e identificaciones de California.",
    },
  },
  "ssa:uscis": {
    "zh-CN": {
      trigger: "需要工作许可或移民身份？",
      explanation: "USCIS 处理工作许可和移民福利申请；SSA 签发 Social Security Number 和卡片。",
    },
    es: {
      trigger: "¿Necesita autorización de empleo o estatus migratorio?",
      explanation: "USCIS maneja autorizaciones de empleo y beneficios migratorios; SSA emite números y tarjetas del Seguro Social.",
    },
  },
  "ssa:ca-dmv": {
    "zh-CN": {
      trigger: "需要加州身份证或驾照？",
      explanation: "DMV 签发加州身份证明和驾驶文件；SSA 不签发州身份证。",
    },
    es: {
      trigger: "¿Necesita una identificación o licencia de conducir de California?",
      explanation: "DMV emite documentos de identidad y conducción de California; SSA no emite identificaciones estatales.",
    },
  },
  "usps:uscis": {
    "zh-CN": {
      trigger: "需要更新移民记录？",
      explanation: "USCIS 要求单独更新地址。USPS 转寄不会更新 USCIS，也不会转寄 USCIS 邮件。",
    },
    es: {
      trigger: "¿Necesita actualizar un registro migratorio?",
      explanation: "USCIS exige su propio cambio de domicilio. El reenvío de USPS no actualiza USCIS ni reenvía su correspondencia.",
    },
  },
  "usps:ca-dmv": {
    "zh-CN": {
      trigger: "需要更新加州驾照、身份证或车辆记录？",
      explanation: "加州 DMV 记录必须单独更新；USPS 转寄不会更改 DMV 记录。",
    },
    es: {
      trigger: "¿Necesita actualizar una licencia, identificación o vehículo de California?",
      explanation: "Los registros del DMV de California requieren su propio cambio de domicilio; el reenvío de USPS no los modifica.",
    },
  },
  "irs:ssa": {
    "zh-CN": {
      trigger: "需要 Social Security Number，而不是仅用于税务的 ITIN？",
      explanation: "SSA 向符合资格的人签发 Social Security Number；IRS 签发的 ITIN 仅用于联邦税务。",
    },
    es: {
      trigger: "¿Necesita un número del Seguro Social en vez de un ITIN solo tributario?",
      explanation: "SSA emite números del Seguro Social a personas elegibles; el IRS emite ITIN únicamente para fines tributarios federales.",
    },
  },
};
