export interface BlogArticle {
  id: string;
  title: string;
  category: string;
  image: string;
  createdAt: string;
  readTime: string;
  tags: string[];
  excerpt: string;
  body: string[];
}

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    id: "category-dmv",
    title: "DMV Checklist for New California Residents",
    category: "DMV",
    image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80",
    createdAt: "July 2, 2026",
    readTime: "6 min read",
    tags: ["DMV", "Driver License", "REAL ID", "California"],
    excerpt: "Plan the DMV tasks most newcomers handle first, from license timing to REAL ID documents.",
    body: [
      "Start by deciding which DMV task you need first: a California driver's license, state ID, REAL ID, vehicle registration, or address update. New residents should review official DMV timelines because deadlines can depend on when they establish residency and whether they bring a vehicle from another state.",
      "Prepare identity, residency, and legal-presence documents before booking an appointment. Common documents include a passport or other identity proof, proof of California address, Social Security information when applicable, and any existing out-of-state license or registration.",
      "Use the DMV website to check forms, fees, test requirements, and appointment availability before visiting an office. Many steps can start online, but users should confirm current rules on the official DMV site before relying on any checklist.",
      "After the visit, keep receipts, temporary paperwork, test results, and renewal reminders together. If a REAL ID or license card arrives by mail, verify the name and address as soon as it is delivered.",
    ],
  },
  {
    id: "category-banking",
    title: "Opening a Bank Account as a Newcomer",
    category: "Banking",
    image: "https://images.unsplash.com/photo-1565514158740-064f34bd6cfd?auto=format&fit=crop&w=1200&q=80",
    createdAt: "July 2, 2026",
    readTime: "5 min read",
    tags: ["Banking", "Passport", "Credit", "Newcomer"],
    excerpt: "Compare account options, prepare identity documents, and avoid common first-account surprises.",
    body: [
      "Most newcomers start with a checking account for daily spending and a savings account for emergency funds. Compare monthly fees, minimum balance rules, branch access, ATM fees, international transfer options, and mobile app support before choosing a bank.",
      "Document requirements vary by bank and branch. Bring a passport or government ID, proof of address if available, phone number, email address, and immigration or student documents when relevant. Call the branch first if you do not yet have a California ID.",
      "Ask how debit cards, online banking, bill pay, direct deposit, and fraud alerts work before leaving the appointment. Keep printed or digital copies of account agreements and fee schedules.",
      "If building credit is a goal, ask about secured credit cards or starter credit products, but compare fees carefully. Financial decisions should be confirmed directly with the bank because policies can change.",
    ],
  },
  {
    id: "category-housing",
    title: "Renting Your First California Home",
    category: "Housing",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
    createdAt: "July 2, 2026",
    readTime: "7 min read",
    tags: ["Housing", "Rent", "Lease", "Neighborhoods"],
    excerpt: "Organize your budget, application documents, lease review, and move-in checklist.",
    body: [
      "Begin with a realistic monthly budget that includes rent, utilities, parking, internet, renter insurance, transportation, and deposits. Compare neighborhoods by commute, school access, grocery options, safety, transit, and noise at different times of day.",
      "Prepare an application packet before touring homes. Landlords commonly ask for ID, income proof, references, credit information, bank statements, or an offer letter. Newcomers without U.S. credit history may need to explain their situation clearly and provide backup documents.",
      "Read the lease before signing, especially sections about deposit rules, repairs, guests, pets, parking, utilities, early termination, and move-out notice. Ask for unclear terms in writing.",
      "Avoid rental scams by verifying the property, never wiring money before confirming legitimacy, and documenting the move-in condition with photos. Local tenant rules vary, so users should confirm city or county guidance when needed.",
    ],
  },
  {
    id: "category-health",
    title: "Healthcare Basics in California",
    category: "Health",
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80",
    createdAt: "July 2, 2026",
    readTime: "6 min read",
    tags: ["Health", "Insurance", "Clinics", "California"],
    excerpt: "Understand insurance basics, choose care options, and prepare for your first appointments.",
    body: [
      "Start by identifying whether you have employer coverage, school insurance, marketplace coverage, Medi-Cal eligibility, travel insurance, or no coverage yet. Learn basic terms such as premium, deductible, copay, coinsurance, network, and out-of-pocket maximum.",
      "Choose the right care setting for the situation. Primary care is usually for ongoing care, urgent care handles many same-day non-emergency needs, emergency rooms are for serious emergencies, and community clinics may help with lower-cost access.",
      "Before appointments, collect insurance cards, ID, medication lists, vaccination records, allergies, past diagnoses, and prior test results. Ask the office whether they are in network and whether translation support is available.",
      "Medical billing can be confusing, so keep explanation-of-benefits letters, bills, payment receipts, and claim numbers together. Users should confirm coverage and costs directly with their insurer or clinic.",
    ],
  },
  {
    id: "guide-1",
    title: "How to Apply for Your First California Driver's License",
    category: "Guide",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAMKD1Df0ESEk-lv-uH3ZYYdkSP-bBXXV1gPf6iPpEzeo-WoSUru8NN6yalo1StqQBq2DT8mOaPEf0dYO45F_A2Xw7c7xmakcj4e_jVKteedu-R4wu_VB6GRNOOo9R4PspBiXST5fKNuZecFPMg8iaCVQL_l-Ebauyg0Twb-KhtkGr9E3LbASlvSDMCL59o_CecUKE05Kh94NJOHr4Lv3YyPJP2q25Qpz2cwmGBNwiplaTOhr_IXrIi5zQFvsHPOJC-uOtmHNwP53E",
    createdAt: "July 2, 2026",
    readTime: "8 min read",
    tags: ["DMV", "License", "Documents", "Appointment"],
    excerpt: "A practical outline for documents, appointments, tests, and REAL ID decisions.",
    body: [
      "Confirm whether you need a first California license, a transfer from another state, or a REAL ID-compliant license. The path can differ depending on age, current license status, driving history, and whether you already hold a valid license from another place.",
      "Build a document folder before booking the appointment. Include identity proof, California residency proof, Social Security information when applicable, and any current license. Check the official DMV document list because names and address formats must match closely.",
      "Prepare for the knowledge test by reading the California Driver Handbook and taking practice tests. If a road test is required, confirm vehicle insurance, registration, and safety requirements before the appointment.",
      "At the DMV office, expect identity review, photo, fees, testing, and temporary paperwork. After applying, track mail delivery and keep temporary documents available until the physical card arrives.",
    ],
  },
  {
    id: "guide-2",
    title: "Navigating the Rental Market: A Newcomer's Handbook",
    category: "Housing",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD-K9DsVJH-QkarCUZtSS1HPYFbl0Ai-apnPW9qURHeUaCcCZso4JfsJ4bsAZcTZ7riVxJkm74cEJClIZ1qj3sa-zpvRNzKeFSdA-XLxXu4GVX0wtWi9oEIS982mKpBSA6UMpLL824T0phfByQKM98zZ5fSqhTf--_hxj-1JJSMCtVPVFB3XZPLpy4vSmSPnVrs8PY9v-2BLTdDDuJjK-dLKI3QjxXv4WKK0B1kRN28MtagZRJ62LKWPJ95iL3ZHt-UsvGPsshPfK0",
    createdAt: "July 2, 2026",
    readTime: "12 min read",
    tags: ["Housing", "Rent", "Application", "Budget"],
    excerpt: "A renter-focused outline for budgeting, applications, lease review, and move-in planning.",
    body: [
      "California rental markets move quickly, so define your must-haves before searching. Prioritize budget, commute, bedrooms, school access, transit, parking, pet rules, and lease length before comparing listings.",
      "A strong application usually includes ID, income proof, references, employment or school letters, and an explanation for limited U.S. credit history. Prepare these documents in a secure folder so you can respond quickly when a unit fits.",
      "Before signing, review the lease for rent due dates, deposits, repair responsibilities, utility rules, parking, subletting, guest limits, and move-out notice. Ask the landlord or property manager to clarify anything that feels vague.",
      "Plan move-in logistics early: electricity, gas, internet, renter insurance, mail forwarding, furniture delivery, and a photo record of the unit condition. Keep all payment receipts and signed documents.",
    ],
  },
  {
    id: "forum-first-30-days",
    title: "First 30 Days in California Community Guide",
    category: "Community Guide",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    createdAt: "July 2, 2026",
    readTime: "9 min read",
    tags: ["First 30 Days", "Newcomer", "Documents", "Community"],
    excerpt: "A week-by-week outline for documents, housing, transportation, banking, health, and local setup.",
    body: [
      "In week one, focus on stable contact information: a local phone number, email access, temporary or permanent address, important document scans, and a simple folder for receipts and appointment confirmations.",
      "In weeks one and two, handle essentials such as housing, utilities, banking, transportation planning, and health coverage research. If you need a DMV, SSN, school, or benefits appointment, check official websites early because appointment availability can vary.",
      "By week three, build local routines: grocery options, pharmacy, primary care search, commute routes, school or work onboarding, and emergency contacts. Save addresses and phone numbers for nearby clinics, transit services, and city resources.",
      "By week four, review what is still pending and ask the community targeted questions. Good forum posts include your city, timeline, documents already prepared, and what decision you are trying to make.",
    ],
  },
  {
    id: "trending-ssn",
    title: "SSN Appointment Wait Times in San Jose",
    category: "Forum Question",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    createdAt: "July 2, 2026",
    readTime: "4 min read",
    tags: ["SSN", "Appointments", "San Jose", "Documents"],
    excerpt: "Understand how to prepare for an SSN visit and what to do when appointments are limited.",
    body: [
      "Appointment availability can change quickly, so check the Social Security Administration website and local office guidance before making plans. Users in San Jose may also compare nearby offices if travel is realistic.",
      "Prepare identity, immigration, work authorization, school, or employment documents based on your situation. Bring originals when required and keep copies for your own records.",
      "If appointments are limited, ask the office about walk-in rules, rescheduling options, and whether another nearby office can help. Avoid relying only on community reports because policies and wait times can change.",
      "After the appointment, keep receipts or confirmation notes and monitor mail delivery. If the card does not arrive within the expected window, contact SSA directly for next steps.",
    ],
  },
  {
    id: "trending-banking",
    title: "Opening a Bank Account With Only a Passport",
    category: "Forum Question",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
    createdAt: "July 2, 2026",
    readTime: "4 min read",
    tags: ["Banking", "Passport", "Account", "Newcomer"],
    excerpt: "A practical checklist for calling branches, preparing backup documents, and comparing bank policies.",
    body: [
      "Some banks may open accounts for newcomers with a passport, but requirements vary by institution and branch. Call ahead and ask exactly which documents are accepted before visiting.",
      "Bring backup documents when possible: proof of address, student or employment letter, visa or immigration document, tax identification information if available, and a local phone number.",
      "Ask about account fees, minimum balances, debit card delivery, online banking access, international transfers, and what happens if you do not yet have a Social Security number.",
      "If one branch cannot help, try another bank or ask what document is missing. Keep notes from each call so you can compare policies without repeating the same questions.",
    ],
  },
];

export function getBlogArticle(id: string) {
  return BLOG_ARTICLES.find((article) => article.id === id);
}
