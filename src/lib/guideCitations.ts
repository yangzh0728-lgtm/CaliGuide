import type { BlogArticle } from "./blogContent";

export interface GuideReference {
  id: string;
  title: string;
  publisher: string;
  url: string;
  purpose: string;
  lastReviewedAt: string;
}

export interface GuideCitationSet {
  references: GuideReference[];
  sectionCitationIds: string[][];
}

interface GuideCitationConfig {
  referenceIds: string[];
  sectionCitationIds: string[][];
}

const REVIEWED_AT = "2026-08-25";

function reference(
  id: string,
  title: string,
  publisher: string,
  url: string,
  purpose: string,
): GuideReference {
  return { id, title, publisher, url, purpose, lastReviewedAt: REVIEWED_AT };
}

export const GUIDE_REFERENCE_LIBRARY: Record<string, GuideReference> = {
  "dmv-new-residents": reference(
    "dmv-new-residents",
    "New California Resident Portal",
    "California Department of Motor Vehicles",
    "https://www.dmv.ca.gov/portal/driver-education-and-safety/special-interest-driver-guides/new-to-california/",
    "New-resident driver license, vehicle registration, and online-service guidance.",
  ),
  "dmv-driver-licenses": reference(
    "dmv-driver-licenses",
    "Driver's Licenses",
    "California Department of Motor Vehicles",
    "https://www.dmv.ca.gov/portal/driver-licenses-identification-cards/driver-licenses-dl/",
    "California driver license eligibility, documents, application, and testing guidance.",
  ),
  "dmv-online-application": reference(
    "dmv-online-application",
    "Online Driver's License or ID Application",
    "California Department of Motor Vehicles",
    "https://www.dmv.ca.gov/portal/driver-licenses-identification-cards/dl-id-online-app-edl-44/",
    "Official online driver license and identification-card application process.",
  ),
  "dmv-handbook": reference(
    "dmv-handbook",
    "California Driver's Handbook",
    "California Department of Motor Vehicles",
    "https://www.dmv.ca.gov/portal/handbook/california-driver-handbook/",
    "Knowledge-test topics, road rules, vehicle requirements, and safe-driving guidance.",
  ),
  "dmv-appointments": reference(
    "dmv-appointments",
    "DMV Appointments",
    "California Department of Motor Vehicles",
    "https://www.dmv.ca.gov/portal/appointments/",
    "Official appointment options for DMV office services and drive tests.",
  ),
  "dmv-real-id": reference(
    "dmv-real-id",
    "What Is REAL ID?",
    "California Department of Motor Vehicles",
    "https://www.dmv.ca.gov/portal/driver-licenses-identification-cards/real-id/what-is-real-id/",
    "REAL ID uses, eligibility, identity proof, Social Security information, and residency requirements.",
  ),
  "dmv-real-id-checklist": reference(
    "dmv-real-id-checklist",
    "REAL ID Interactive Checklist",
    "California Department of Motor Vehicles",
    "https://www.dmv.ca.gov/portal/driver-licenses-identification-cards/real-id/real-id-checklist/",
    "Personalized checklist of documents required for a California REAL ID application.",
  ),
  "dmv-real-id-noncitizens": reference(
    "dmv-real-id-noncitizens",
    "REAL ID Information for Non-U.S. Citizens",
    "California Department of Motor Vehicles",
    "https://www.dmv.ca.gov/portal/driver-licenses-identification-cards/real-id/what-is-real-id/real-id-info-non-u-s-citizens/",
    "REAL ID document guidance for eligible non-U.S. citizens.",
  ),
  "dmv-private-vehicle": reference(
    "dmv-private-vehicle",
    "Registering a Vehicle Purchased from a Private Party",
    "California Department of Motor Vehicles",
    "https://www.dmv.ca.gov/portal/vehicle-registration/new-registration/registering-a-vehicle-purchased-from-a-private-party/",
    "Documents and steps for a California private-party vehicle purchase.",
  ),
  "dmv-title-transfer": reference(
    "dmv-title-transfer",
    "Title Transfers and Changes",
    "California Department of Motor Vehicles",
    "https://www.dmv.ca.gov/portal/vehicle-registration/titles/title-transfers-and-changes/",
    "Official title-transfer deadlines, forms, and ownership-change requirements.",
  ),
  "dmv-insurance": reference(
    "dmv-insurance",
    "Vehicle Insurance Requirements",
    "California Department of Motor Vehicles",
    "https://www.dmv.ca.gov/portal/vehicle-registration/insurance-requirements/",
    "California financial-responsibility and vehicle-insurance requirements.",
  ),
  "ca-insurance-auto": reference(
    "ca-insurance-auto",
    "Automobile Insurance Guide",
    "California Department of Insurance",
    "https://www.insurance.ca.gov/01-consumers/105-type/95-guides/01-auto/auto101.cfm",
    "Consumer guidance for comparing California automobile insurance coverage.",
  ),
  "fdic-getbanked": reference(
    "fdic-getbanked",
    "GetBanked",
    "Federal Deposit Insurance Corporation",
    "https://www.fdic.gov/getbanked",
    "Bank-account preparation, low-cost accounts, and information for people without an SSN.",
  ),
  "fdic-bankfind": reference(
    "fdic-bankfind",
    "BankFind Suite",
    "Federal Deposit Insurance Corporation",
    "https://banks.data.fdic.gov/bankfind-suite/bankfind",
    "Official tool for checking whether a bank is FDIC insured.",
  ),
  "fdic-deposit-insurance": reference(
    "fdic-deposit-insurance",
    "Deposit Insurance",
    "Federal Deposit Insurance Corporation",
    "https://www.fdic.gov/resources/deposit-insurance",
    "Coverage rules for deposits held at FDIC-insured banks.",
  ),
  "cfpb-bank-accounts": reference(
    "cfpb-bank-accounts",
    "Bank Accounts and Services",
    "Consumer Financial Protection Bureau",
    "https://www.consumerfinance.gov/consumer-tools/bank-accounts/",
    "Bank-account choices, fees, identity requirements, and consumer rights.",
  ),
  "cfpb-complaint": reference(
    "cfpb-complaint",
    "Submit a Complaint",
    "Consumer Financial Protection Bureau",
    "https://www.consumerfinance.gov/complaint/",
    "Official complaint process for unresolved financial-product or bank-account problems.",
  ),
  "irs-itin": reference(
    "irs-itin",
    "Individual Taxpayer Identification Number",
    "Internal Revenue Service",
    "https://www.irs.gov/tin/itin/individual-taxpayer-identification-number-itin",
    "Official explanation of ITIN purpose, eligibility, and limitations.",
  ),
  "ca-doj-tenants": reference(
    "ca-doj-tenants",
    "Landlord-Tenant Issues",
    "California Department of Justice",
    "https://oag.ca.gov/tenants",
    "California tenant protections, security-deposit limits, lawful deductions, and move-out rules.",
  ),
  "ca-courts-deposits": reference(
    "ca-courts-deposits",
    "Guide to Security Deposits in California",
    "California Courts",
    "https://selfhelp.courts.ca.gov/guide-security-deposits-california",
    "Security-deposit inspections, deductions, documentation, and the 21-day return process.",
  ),
  "ca-dre-rental-guide": reference(
    "ca-dre-rental-guide",
    "California Tenants: A Guide to Residential Tenants' and Landlords' Rights and Responsibilities",
    "California Department of Real Estate",
    "https://www.dre.ca.gov/publications/ResourceGuidebook/2026_Landlord_Tenant_Guide.pdf",
    "Official California guidance for rental applications, leases, payments, inspections, and moving out.",
  ),
  "cfpb-tenant-screening": reference(
    "cfpb-tenant-screening",
    "What Is a Tenant Screening Report?",
    "Consumer Financial Protection Bureau",
    "https://www.consumerfinance.gov/ask-cfpb/what-is-a-tenant-screening-report-en-2102/",
    "Consumer guidance on rental background and tenant-screening reports.",
  ),
  "ftc-rental-scams": reference(
    "ftc-rental-scams",
    "Rental Listing Scams",
    "Federal Trade Commission",
    "https://consumer.ftc.gov/articles/rental-listing-scams",
    "Warning signs, safe payment practices, and reporting steps for rental-listing scams.",
  ),
  "covered-coverage-basics": reference(
    "covered-coverage-basics",
    "Coverage Basics",
    "Covered California",
    "https://www.coveredca.com/learning-center/coverage-basics/",
    "Official health-plan basics, costs, enrollment, and coverage terminology.",
  ),
  "covered-medi-cal": reference(
    "covered-medi-cal",
    "Medi-Cal",
    "Covered California",
    "https://www.coveredca.com/health/medi-cal/",
    "Medi-Cal eligibility overview and application pathway.",
  ),
  "covered-special-enrollment": reference(
    "covered-special-enrollment",
    "Special Enrollment",
    "Covered California",
    "https://www.coveredca.com/special-enrollment/",
    "Qualifying life events and enrollment periods outside annual open enrollment.",
  ),
  "covered-providers": reference(
    "covered-providers",
    "Find Providers in Your Network",
    "Covered California",
    "https://www.coveredca.com/support/before-you-buy/providers/",
    "How to check whether doctors and facilities participate in a health plan's network.",
  ),
  "covered-care-options": reference(
    "covered-care-options",
    "Telehealth, Doctor's Office, Urgent Care or Emergency Room",
    "Covered California",
    "https://www.coveredca.com/marketing-blog/telehealth-doctors-office-urgent-care-or-emergency-room/",
    "General guidance for choosing among common places to receive medical care.",
  ),
  "ssa-number-card": reference(
    "ssa-number-card",
    "Social Security Number and Card",
    "Social Security Administration",
    "https://www.ssa.gov/number-card",
    "Official SSN application, replacement-card, and required-document guidance.",
  ),
  "ssa-office-locator": reference(
    "ssa-office-locator",
    "Social Security Office Locator",
    "Social Security Administration",
    "https://www.ssa.gov/locator/",
    "Official locator for nearby Social Security offices and contact details.",
  ),
  "cbp-i94": reference(
    "cbp-i94",
    "I-94 Official Website",
    "U.S. Customs and Border Protection",
    "https://i94.cbp.dhs.gov/home",
    "Official retrieval of recent electronic I-94 arrival records.",
  ),
  "uscis-documents": reference(
    "uscis-documents",
    "Immigration Documents and How to Correct, Update or Replace Them",
    "U.S. Citizenship and Immigration Services",
    "https://www.uscis.gov/tools/uscis-tools-and-resources/immigration-documents-and-how-to-correct-update-or-replace-them",
    "Official guidance for maintaining and correcting immigration documents.",
  ),
  "uscis-address-change": reference(
    "uscis-address-change",
    "How to Change Your Address",
    "U.S. Citizenship and Immigration Services",
    "https://www.uscis.gov/addresschange",
    "Official address-change requirements and online reporting process.",
  ),
  "uscis-legal-services": reference(
    "uscis-legal-services",
    "Find Legal Services",
    "U.S. Citizenship and Immigration Services",
    "https://www.uscis.gov/scams-fraud-and-misconduct/avoid-scams/find-legal-services",
    "How to locate authorized immigration legal help and avoid unauthorized providers.",
  ),
  "uscis-i9": reference(
    "uscis-i9",
    "Form I-9, Employment Eligibility Verification",
    "U.S. Citizenship and Immigration Services",
    "https://www.uscis.gov/i-9",
    "Official employment-eligibility verification process for new hires.",
  ),
  "uscis-i9-documents": reference(
    "uscis-i9-documents",
    "Form I-9 Acceptable Documents",
    "U.S. Citizenship and Immigration Services",
    "https://www.uscis.gov/i-9-central/form-i-9-acceptable-documents",
    "Lists of documents employees may present for Form I-9 verification.",
  ),
  "edd-jobs-training": reference(
    "edd-jobs-training",
    "Jobs and Training",
    "California Employment Development Department",
    "https://edd.ca.gov/jobs_and_training/",
    "California job-search, training, and workforce-service resources.",
  ),
  "edd-ajcc": reference(
    "edd-ajcc",
    "America's Job Center of California",
    "California Employment Development Department",
    "https://edd.ca.gov/en/jobs_and_training/TCLobby/",
    "Free local employment, resume, job-search, and training assistance.",
  ),
  caljobs: reference(
    "caljobs",
    "CalJOBS",
    "State of California",
    "https://www.caljobs.ca.gov/",
    "California's official online employment and workforce-services system.",
  ),
  "cde-newcomer-students": reference(
    "cde-newcomer-students",
    "Newcomer Students",
    "California Department of Education",
    "https://www.cde.ca.gov/sp/ml/newcomerstudnts.asp",
    "State resources and guidance for newcomer students and their families.",
  ),
  "cde-english-learner-roadmap": reference(
    "cde-english-learner-roadmap",
    "California English Learner Roadmap",
    "California Department of Education",
    "https://www.cde.ca.gov/sp/ml/roadmap.asp",
    "California policy and resources for English Learner education and family engagement.",
  ),
  "shots-for-school": reference(
    "shots-for-school",
    "Shots for School",
    "California Department of Public Health",
    "https://www.shotsforschool.org/",
    "California school immunization requirements and family resources.",
  ),
  "bay-area-511": reference(
    "bay-area-511",
    "511 Bay Area",
    "Metropolitan Transportation Commission",
    "https://511.org/home",
    "Official Bay Area transit, traffic, bicycling, and trip-planning information.",
  ),
  "southern-california-511": reference(
    "southern-california-511",
    "Go511",
    "Southern California 511",
    "https://go511.com/",
    "Regional traffic, transit, and commuter information for Southern California.",
  ),
  "211-california": reference(
    "211-california",
    "211 California",
    "211 California",
    "https://211ca.org/",
    "Local referrals for housing, food, health, transportation, and community services.",
  ),
  "california-services": reference(
    "california-services",
    "California State Services",
    "State of California",
    "https://www.ca.gov/services/",
    "Official directory of California government services and programs.",
  ),
  "earthquake-warning-ca": reference(
    "earthquake-warning-ca",
    "California Earthquake Early Warning",
    "California Governor's Office of Emergency Services",
    "https://www.earthquake.ca.gov/",
    "Earthquake alert options and official Drop, Cover, and Hold On instructions.",
  ),
  "calfire-go-evacuation": reference(
    "calfire-go-evacuation",
    "Go Evacuation Guide",
    "CAL FIRE",
    "https://www.readyforwildfire.org/prepare-for-wildfire/go-evacuation-guide",
    "Wildfire evacuation planning, go-bag preparation, orders, pets, and returning safely.",
  ),
  "airnow-fire-smoke": reference(
    "airnow-fire-smoke",
    "Fire and Smoke Map",
    "U.S. Environmental Protection Agency",
    "https://www.airnow.gov/fasm-v4/",
    "Current smoke, fire, fine-particle pollution, AQI, and health-protection information.",
  ),
  "doj-eoir-representation": reference(
    "doj-eoir-representation",
    "Can Someone Represent You Before EOIR?",
    "U.S. Department of Justice",
    "https://www.justice.gov/eoir/can-someone-represent-you-eoir",
    "Authorized immigration-court representatives and limits on notarios and document preparers.",
  ),
  "doj-notario-notice": reference(
    "doj-notario-notice",
    "Notario National Notice",
    "U.S. Department of Justice",
    "https://www.justice.gov/eoir/notario-national-notice",
    "Warnings about notario fraud, blank forms, false information, receipts, and document copies.",
  ),
  "dir-all-workers": reference(
    "dir-all-workers",
    "In California, All Workers Are Protected",
    "California Department of Industrial Relations",
    "https://www.dir.ca.gov/california-worker/",
    "Wage, safety, workers' compensation, retaliation, and immigration-status protections.",
  ),
  "dir-worker-faq": reference(
    "dir-worker-faq",
    "Frequently Asked Questions for Workers in California",
    "California Department of Industrial Relations",
    "https://www.dir.ca.gov/California-Worker/FAQ-for-California-Workers.html",
    "Practical evidence, wage-theft, retaliation, immigration-status, and assistance guidance.",
  ),
  "dlse-wage-claim": reference(
    "dlse-wage-claim",
    "File a Wage Claim",
    "California Labor Commissioner's Office",
    "https://www.dir.ca.gov/dlse/HowToFileWageClaim.htm",
    "Official process for seeking unpaid wages and preparing supporting documentation.",
  ),
  "dlse-report-violation": reference(
    "dlse-report-violation",
    "Report a Labor Law Violation",
    "California Labor Commissioner's Office",
    "https://www.dir.ca.gov/dlse/HowToReportViolationtoBOFE.htm",
    "Reporting widespread wage theft and labor-law violations affecting groups of workers.",
  ),
};

const GUIDE_CITATION_CONFIGS: Record<string, GuideCitationConfig> = {
  "category-dmv": {
    referenceIds: ["dmv-new-residents", "dmv-driver-licenses", "dmv-real-id"],
    sectionCitationIds: [
      ["dmv-new-residents"],
      ["dmv-driver-licenses", "dmv-real-id"],
      ["dmv-new-residents", "dmv-driver-licenses"],
      ["dmv-new-residents"],
    ],
  },
  "category-banking": {
    referenceIds: ["fdic-getbanked", "cfpb-bank-accounts", "fdic-bankfind", "fdic-deposit-insurance", "cfpb-complaint"],
    sectionCitationIds: [
      ["fdic-getbanked"],
      ["fdic-getbanked", "cfpb-bank-accounts"],
      ["cfpb-bank-accounts"],
      ["cfpb-bank-accounts"],
      ["fdic-bankfind", "fdic-deposit-insurance"],
      ["fdic-getbanked"],
      ["cfpb-bank-accounts"],
      ["fdic-getbanked", "cfpb-complaint"],
    ],
  },
  "category-housing": {
    referenceIds: ["ca-dre-rental-guide", "cfpb-tenant-screening", "ftc-rental-scams", "ca-doj-tenants", "ca-courts-deposits"],
    sectionCitationIds: [
      ["ca-dre-rental-guide"],
      ["ca-dre-rental-guide", "cfpb-tenant-screening"],
      ["ca-dre-rental-guide"],
      ["cfpb-tenant-screening", "ftc-rental-scams"],
      ["ca-dre-rental-guide", "ca-doj-tenants"],
      ["ca-dre-rental-guide", "ca-courts-deposits"],
      ["ftc-rental-scams", "ca-dre-rental-guide"],
      ["ca-doj-tenants", "ca-courts-deposits"],
    ],
  },
  "category-health": {
    referenceIds: ["covered-coverage-basics", "covered-medi-cal", "covered-special-enrollment", "covered-providers", "covered-care-options"],
    sectionCitationIds: [
      ["covered-coverage-basics", "covered-medi-cal"],
      ["covered-coverage-basics"],
      ["covered-coverage-basics"],
      ["covered-medi-cal"],
      ["covered-special-enrollment"],
      ["covered-coverage-basics", "covered-providers"],
      ["covered-providers", "covered-care-options"],
      ["covered-coverage-basics", "covered-medi-cal"],
    ],
  },
  "guide-1": {
    referenceIds: ["dmv-driver-licenses", "dmv-real-id", "dmv-online-application", "dmv-handbook", "dmv-appointments"],
    sectionCitationIds: [
      ["dmv-driver-licenses", "dmv-real-id"],
      ["dmv-driver-licenses", "dmv-real-id"],
      ["dmv-driver-licenses", "dmv-real-id"],
      ["dmv-online-application", "dmv-driver-licenses"],
      ["dmv-handbook", "dmv-driver-licenses"],
      ["dmv-appointments", "dmv-handbook"],
      ["dmv-driver-licenses", "dmv-real-id", "dmv-handbook"],
      ["dmv-driver-licenses", "dmv-handbook"],
    ],
  },
  "guide-real-id-documents": {
    referenceIds: ["dmv-real-id", "dmv-real-id-checklist", "dmv-real-id-noncitizens", "dmv-appointments"],
    sectionCitationIds: [
      ["dmv-real-id", "dmv-real-id-noncitizens"],
      ["dmv-real-id-checklist"],
      ["dmv-real-id"],
      ["dmv-real-id-checklist", "dmv-real-id-noncitizens"],
      ["dmv-real-id", "dmv-real-id-checklist"],
      ["dmv-real-id-checklist"],
      ["dmv-real-id-checklist", "dmv-appointments"],
      ["dmv-real-id", "dmv-real-id-checklist", "dmv-real-id-noncitizens"],
      ["dmv-real-id", "dmv-real-id-checklist"],
    ],
  },
  "guide-2": {
    referenceIds: ["ca-dre-rental-guide", "cfpb-tenant-screening", "ftc-rental-scams", "ca-doj-tenants", "ca-courts-deposits"],
    sectionCitationIds: [
      ["ca-dre-rental-guide"],
      ["ca-dre-rental-guide"],
      ["cfpb-tenant-screening", "ftc-rental-scams"],
      ["ca-dre-rental-guide", "ca-doj-tenants"],
      ["ca-dre-rental-guide", "ca-courts-deposits"],
      ["ca-doj-tenants", "ca-courts-deposits"],
    ],
  },
  "guide-rental-scams": {
    referenceIds: ["ftc-rental-scams", "ca-dre-rental-guide", "cfpb-tenant-screening", "ca-doj-tenants"],
    sectionCitationIds: [
      ["ftc-rental-scams"],
      ["ftc-rental-scams", "ca-dre-rental-guide"],
      ["ftc-rental-scams"],
      ["ftc-rental-scams", "cfpb-tenant-screening"],
      ["ftc-rental-scams", "ca-dre-rental-guide"],
      ["ftc-rental-scams", "ca-doj-tenants"],
      ["ftc-rental-scams"],
      ["ftc-rental-scams", "ca-dre-rental-guide"],
    ],
  },
  "forum-first-30-days": {
    referenceIds: [
      "california-services",
      "211-california",
      "cbp-i94",
      "uscis-documents",
      "ssa-number-card",
      "fdic-getbanked",
      "dmv-new-residents",
      "dmv-real-id-checklist",
      "cde-newcomer-students",
      "shots-for-school",
      "covered-special-enrollment",
      "uscis-i9",
      "cfpb-tenant-screening",
      "earthquake-warning-ca",
      "calfire-go-evacuation",
      "dir-all-workers",
      "doj-notario-notice",
    ],
    sectionCitationIds: [
      ["california-services"],
      ["fdic-getbanked", "ssa-number-card", "dmv-real-id-checklist", "cde-newcomer-students"],
      ["cbp-i94", "fdic-getbanked", "cde-newcomer-students"],
      ["cbp-i94", "uscis-documents", "shots-for-school"],
      ["fdic-getbanked", "dmv-new-residents"],
      ["ssa-number-card", "fdic-getbanked"],
      ["dmv-new-residents", "dmv-real-id-checklist", "cde-newcomer-students", "covered-special-enrollment"],
      ["dmv-real-id-checklist", "uscis-i9", "cfpb-tenant-screening"],
      ["earthquake-warning-ca", "calfire-go-evacuation", "dir-all-workers", "doj-notario-notice"],
      ["fdic-getbanked", "dmv-real-id-checklist", "ssa-number-card", "uscis-i9", "doj-notario-notice"],
      ["california-services", "211-california"],
    ],
  },
  "trending-ssn": {
    referenceIds: ["ssa-number-card", "ssa-office-locator"],
    sectionCitationIds: [
      ["ssa-number-card", "ssa-office-locator"],
      ["ssa-number-card"],
      ["ssa-office-locator"],
      ["ssa-number-card"],
    ],
  },
  "trending-banking": {
    referenceIds: ["cfpb-bank-accounts", "fdic-getbanked", "irs-itin", "fdic-bankfind", "fdic-deposit-insurance"],
    sectionCitationIds: [
      ["cfpb-bank-accounts", "fdic-getbanked"],
      ["fdic-getbanked"],
      ["irs-itin"],
      ["cfpb-bank-accounts", "fdic-getbanked"],
      ["cfpb-bank-accounts", "fdic-deposit-insurance"],
      ["cfpb-bank-accounts"],
      ["irs-itin", "cfpb-bank-accounts"],
      ["cfpb-bank-accounts", "fdic-getbanked"],
    ],
  },
  "guide-first-doctor-visit": {
    referenceIds: ["covered-care-options", "covered-providers", "covered-coverage-basics", "covered-medi-cal"],
    sectionCitationIds: [
      ["covered-coverage-basics", "covered-medi-cal"],
      ["covered-coverage-basics"],
      ["covered-care-options"],
      ["covered-providers", "covered-medi-cal"],
      ["covered-providers", "covered-coverage-basics"],
      ["covered-coverage-basics"],
      ["covered-coverage-basics"],
      ["covered-providers", "covered-coverage-basics"],
      ["covered-care-options", "covered-medi-cal"],
    ],
  },
  "guide-legal-30-day-documents": {
    referenceIds: ["cbp-i94", "uscis-documents", "uscis-address-change", "uscis-legal-services"],
    sectionCitationIds: [
      ["uscis-documents"],
      ["uscis-documents", "cbp-i94"],
      ["uscis-documents"],
      ["uscis-documents"],
      ["cbp-i94", "uscis-address-change"],
      ["cbp-i94", "uscis-address-change"],
      ["cbp-i94", "uscis-address-change", "uscis-legal-services"],
    ],
  },
  "guide-newcomer-job-search": {
    referenceIds: ["uscis-i9", "uscis-i9-documents", "edd-jobs-training", "edd-ajcc", "caljobs", "uscis-legal-services"],
    sectionCitationIds: [
      ["edd-jobs-training", "uscis-i9"],
      ["uscis-i9-documents", "edd-jobs-training"],
      ["uscis-i9", "uscis-i9-documents"],
      ["edd-jobs-training"],
      ["caljobs", "edd-jobs-training"],
      ["edd-ajcc"],
      ["uscis-i9", "uscis-i9-documents"],
      ["uscis-legal-services", "edd-ajcc"],
    ],
  },
  "guide-school-esl-resources": {
    referenceIds: ["cde-newcomer-students", "cde-english-learner-roadmap", "shots-for-school"],
    sectionCitationIds: [
      ["cde-newcomer-students"],
      ["cde-newcomer-students", "shots-for-school"],
      ["cde-newcomer-students"],
      ["cde-newcomer-students", "shots-for-school"],
      ["cde-english-learner-roadmap"],
      ["cde-newcomer-students", "cde-english-learner-roadmap"],
      ["cde-newcomer-students", "shots-for-school"],
      ["cde-newcomer-students", "cde-english-learner-roadmap"],
    ],
  },
  "guide-california-transportation": {
    referenceIds: ["bay-area-511", "southern-california-511", "dmv-private-vehicle", "dmv-title-transfer", "dmv-new-residents", "dmv-insurance", "ca-insurance-auto"],
    sectionCitationIds: [
      ["bay-area-511", "southern-california-511", "dmv-new-residents"],
      ["dmv-private-vehicle", "dmv-insurance"],
      ["bay-area-511", "southern-california-511"],
      ["dmv-insurance", "ca-insurance-auto"],
      ["dmv-private-vehicle", "dmv-title-transfer"],
      ["dmv-title-transfer", "dmv-new-residents"],
      ["dmv-private-vehicle", "dmv-insurance"],
      ["dmv-insurance", "ca-insurance-auto"],
    ],
  },
  "guide-earthquake-wildfire-preparedness": {
    referenceIds: ["earthquake-warning-ca", "calfire-go-evacuation", "airnow-fire-smoke"],
    sectionCitationIds: [
      ["earthquake-warning-ca", "calfire-go-evacuation", "airnow-fire-smoke"],
      ["earthquake-warning-ca", "calfire-go-evacuation", "airnow-fire-smoke"],
      ["earthquake-warning-ca"],
      ["earthquake-warning-ca"],
      ["calfire-go-evacuation"],
      ["airnow-fire-smoke"],
      ["earthquake-warning-ca", "calfire-go-evacuation", "airnow-fire-smoke"],
      ["calfire-go-evacuation", "airnow-fire-smoke"],
    ],
  },
  "guide-notario-fraud": {
    referenceIds: ["doj-eoir-representation", "uscis-legal-services", "doj-notario-notice"],
    sectionCitationIds: [
      ["doj-notario-notice"],
      ["doj-eoir-representation", "doj-notario-notice"],
      ["doj-eoir-representation", "doj-notario-notice"],
      ["doj-eoir-representation", "uscis-legal-services"],
      ["doj-notario-notice"],
      ["uscis-legal-services", "doj-notario-notice"],
      ["doj-notario-notice"],
      ["doj-eoir-representation", "uscis-legal-services"],
    ],
  },
  "guide-workers-rights-wage-theft": {
    referenceIds: ["dir-all-workers", "dir-worker-faq", "dlse-wage-claim", "dlse-report-violation"],
    sectionCitationIds: [
      ["dir-all-workers", "dir-worker-faq"],
      ["dir-worker-faq", "dlse-wage-claim"],
      ["dir-all-workers", "dir-worker-faq"],
      ["dir-worker-faq", "dlse-wage-claim", "dlse-report-violation"],
      ["dir-all-workers", "dir-worker-faq"],
      ["dlse-wage-claim", "dlse-report-violation"],
      ["dir-worker-faq", "dlse-wage-claim"],
      ["dir-all-workers", "dlse-wage-claim"],
    ],
  },
};

export function getGuideCitationSet(articleId: string): GuideCitationSet | undefined {
  const config = GUIDE_CITATION_CONFIGS[articleId];
  if (!config) {
    return undefined;
  }

  return {
    references: config.referenceIds
      .map((referenceId) => GUIDE_REFERENCE_LIBRARY[referenceId])
      .filter((item): item is GuideReference => Boolean(item)),
    sectionCitationIds: config.sectionCitationIds,
  };
}

export function getSectionCitationNumbers(citationSet: GuideCitationSet, sectionIndex: number): number[] {
  const citationIds = citationSet.sectionCitationIds[sectionIndex] ?? [];
  return citationIds
    .map((citationId) => citationSet.references.findIndex((referenceItem) => referenceItem.id === citationId) + 1)
    .filter((number, index, numbers) => number > 0 && numbers.indexOf(number) === index);
}

export function validateGuideCitationCoverage(articles: BlogArticle[]): string[] {
  const errors: string[] = [];

  for (const article of articles) {
    const citationSet = getGuideCitationSet(article.id);
    if (!citationSet) {
      errors.push(`${article.id}: missing citation set`);
      continue;
    }

    if (citationSet.sectionCitationIds.length !== article.body.length) {
      errors.push(
        `${article.id}: expected ${article.body.length} section citation groups, received ${citationSet.sectionCitationIds.length}`,
      );
    }

    const referenceIds = new Set(citationSet.references.map((referenceItem) => referenceItem.id));
    citationSet.sectionCitationIds.forEach((citationIds, sectionIndex) => {
      if (citationIds.length === 0) {
        errors.push(`${article.id}: section ${sectionIndex + 1} has no citations`);
      }
      citationIds.forEach((citationId) => {
        if (!referenceIds.has(citationId)) {
          errors.push(`${article.id}: section ${sectionIndex + 1} cites unknown source ${citationId}`);
        }
      });
    });
  }

  return errors;
}
