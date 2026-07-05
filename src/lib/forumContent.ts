export interface ForumComment {
  id: string;
  userId?: string;
  author: string;
  avatar: string;
  time: string;
  body: string;
  usefulCount?: number;
  usefulUserIds?: string[];
  unusefulCount?: number;
  unusefulUserIds?: string[];
}

export interface ForumDiscussion {
  id: string;
  userId?: string;
  author: string;
  avatar: string;
  time: string;
  category: string;
  title: string;
  excerpt: string;
  comments: number;
  views: string;
  tags: string[];
  imageUrls?: string[];
  body: string[];
  replies: ForumComment[];
  usefulCount?: number;
  usefulUserIds?: string[];
  unusefulCount?: number;
  unusefulUserIds?: string[];
}

export interface ForumTopic {
  id: string;
  translationKey: string;
}

export const FORUM_TOPICS: ForumTopic[] = [
  { id: "All Topics", translationKey: "forum.allTopics" },
  { id: "Banking", translationKey: "forum.category.banking" },
  { id: "Housing", translationKey: "forum.category.housing" },
  { id: "Jobs", translationKey: "forum.category.jobs" },
  { id: "Health", translationKey: "forum.category.health" },
  { id: "Transportation", translationKey: "forum.category.transportation" },
  { id: "Education", translationKey: "forum.category.education" },
  { id: "Legal / Immigration", translationKey: "forum.category.legal" },
];

export const FORUM_DISCUSSIONS: ForumDiscussion[] = [
  {
    id: "post-1",
    author: "Julian Doe",
    avatar: "JD",
    time: "2 hours ago",
    category: "Housing",
    title: "Best areas for new families in the San Francisco Bay Area with school access?",
    excerpt:
      "I'm moving from Toronto and looking for a safe neighborhood that has strong public elementary schools. Budget is around $3k-$4k for a 2-bedroom rental...",
    comments: 24,
    views: "1.2k",
    tags: ["Housing", "Schools", "Bay Area", "Family"],
    usefulCount: 18,
    unusefulCount: 2,
    body: [
      "We are moving to the Bay Area with one elementary-age child and are trying to balance school access, commute, and rent. Our likely work locations are San Francisco and the Peninsula, but we are still comparing hybrid schedules.",
      "I am looking at public school district boundaries, rental listings, and commute maps, but the information feels scattered. Some apartments list a school name, while district lookup tools sometimes show a different assignment.",
      "What questions should we ask before signing a lease? I would especially appreciate advice on checking school boundaries, understanding commute tradeoffs, and choosing between a slightly higher rent or a longer drive.",
    ],
    replies: [
      {
        id: "reply-1",
        author: "Sarah M.",
        avatar: "SM",
        time: "1 hour ago",
        body: "Use the school district boundary lookup, not only the rental listing. I would also email the district with the exact address before applying for a lease.",
        usefulCount: 9,
        unusefulCount: 1,
      },
      {
        id: "reply-2",
        author: "Michael K.",
        avatar: "MK",
        time: "38 min ago",
        body: "Try the commute at the exact time you would travel. A place that looks close on a map can feel very different during bridge or freeway traffic.",
        usefulCount: 6,
        unusefulCount: 0,
      },
      {
        id: "reply-6",
        author: "Mei L.",
        avatar: "ML",
        time: "18 min ago",
        body: "If you can, visit the neighborhood after school pickup and again at night. Parking, traffic, and noise patterns can change a lot across the day.",
        usefulCount: 4,
        unusefulCount: 0,
      },
    ],
  },
  {
    id: "post-2",
    author: "Sarah M.",
    avatar: "SM",
    time: "5h ago",
    category: "Banking",
    title: "How long does it typically take to open a Chase account with a non-resident ID?",
    excerpt: "I have my passport and local proof of address ready, just wondering if I can do it in one visit...",
    comments: 12,
    views: "800",
    tags: ["Banking", "Passport", "Chase", "Newcomer"],
    usefulCount: 12,
    unusefulCount: 1,
    body: [
      "I have a passport and a local proof of address, but I do not have a California ID yet. I am hoping to open a checking account quickly so I can receive payments and pay rent.",
      "I called one branch and got a vague answer about needing identification and address proof. I am not sure whether a lease, phone bill, university letter, or employer letter would be accepted.",
      "For people who opened an account recently, did you need an appointment, and did the debit card arrive by mail? I am also curious whether online banking worked immediately after opening the account.",
    ],
    replies: [
      {
        id: "reply-3",
        author: "Anita R.",
        avatar: "AR",
        time: "3h ago",
        body: "Call the exact branch before you go. I had one branch say no over the phone, then another branch accepted my passport and lease.",
        usefulCount: 7,
        unusefulCount: 1,
      },
      {
        id: "reply-7",
        author: "Victor H.",
        avatar: "VH",
        time: "2h ago",
        body: "Bring printed copies even if you have PDFs. The banker at my appointment wanted to scan paper documents for proof of address.",
        usefulCount: 5,
        unusefulCount: 0,
      },
    ],
  },
  {
    id: "post-3",
    author: "Michael K.",
    avatar: "MK",
    time: "8h ago",
    category: "Jobs",
    title: "Understanding the current job market for tech in SoCal vs NorCal?",
    excerpt: "I'm hearing mixed things about the job availability in Irvine compared to Mountain View...",
    comments: 45,
    views: "2.1k",
    tags: ["Jobs", "Tech", "SoCal", "NorCal"],
    usefulCount: 27,
    unusefulCount: 3,
    body: [
      "I am comparing technology roles in Irvine, Los Angeles, San Diego, San Jose, and Mountain View. I see more big-company listings in the Bay Area, but Southern California looks more affordable in some neighborhoods.",
      "My main questions are about interview volume, hybrid expectations, salary ranges, and whether networking events are active enough outside the Bay Area. I am open to software, data, or product-adjacent roles.",
      "If you recently interviewed in either region, how did the process feel? I would like to understand whether lower rent in SoCal balances out fewer nearby opportunities, or whether remote roles make the difference smaller.",
    ],
    replies: [
      {
        id: "reply-4",
        author: "Leo C.",
        avatar: "LC",
        time: "6h ago",
        body: "Check hybrid expectations before comparing salaries. A Bay Area offer can look higher until you factor in commute distance and office days.",
        usefulCount: 10,
        unusefulCount: 1,
      },
      {
        id: "reply-8",
        author: "Nora P.",
        avatar: "NP",
        time: "4h ago",
        body: "Look at meetup and alumni calendars for each city. The networking scene is very different between Irvine, LA, and the Peninsula.",
        usefulCount: 8,
        unusefulCount: 0,
      },
    ],
  },
  {
    id: "post-4",
    author: "Priya S.",
    avatar: "PS",
    time: "1 day ago",
    category: "Health",
    title: "Which documents should I prepare before changing visa status and health insurance?",
    excerpt: "I am organizing my records and want to avoid missing paperwork before my next appointment...",
    comments: 18,
    views: "940",
    tags: ["Health", "Visa", "Insurance", "Documents"],
    usefulCount: 15,
    unusefulCount: 1,
    body: [
      "I am preparing for a status change and also need to review my health insurance options. I want one organized folder before appointments so I do not miss letters, dates, or prior coverage details.",
      "So far I have my passport, visa documents, I-94, insurance card, plan letters, and appointment confirmations. I am unsure what else people usually keep together before speaking with a qualified professional.",
      "I know this is not legal or medical advice. I am looking for practical organization tips: folder structure, naming documents, tracking deadlines, and questions to ask an attorney, school office, employer, clinic, or insurer.",
    ],
    replies: [
      {
        id: "reply-5",
        author: "Carmen L.",
        avatar: "CL",
        time: "20h ago",
        body: "Keep insurance letters, ID documents, and appointment confirmations in the same folder, then separate originals from scanned copies.",
        usefulCount: 8,
        unusefulCount: 1,
      },
      {
        id: "reply-9",
        author: "Daniel W.",
        avatar: "DW",
        time: "18h ago",
        body: "Add the date you received each letter. When someone asks for a timeline, those dates are easier to trust than memory.",
        usefulCount: 5,
        unusefulCount: 0,
      },
    ],
  },
  {
    id: "post-5",
    author: "Mateo R.",
    avatar: "MR",
    time: "2 days ago",
    category: "Transportation",
    title: "Is it easier to commute around LA with Metro, rideshare, or buying a used car?",
    excerpt:
      "I am comparing monthly transit costs, parking, insurance, and whether a used car is worth it for a new arrival...",
    comments: 31,
    views: "1.5k",
    tags: ["Transportation", "Metro", "Commute", "Used Car"],
    usefulCount: 19,
    unusefulCount: 2,
    body: [
      "I am moving to Los Angeles and trying to decide whether I can rely on Metro and rideshare for the first few months or whether I should buy a used car soon after arriving.",
      "The monthly cost comparison is confusing because I need to include insurance, parking, gas, registration, maintenance, rideshare backups, and time spent commuting. Some neighborhoods look transit-friendly, but only for certain routes.",
      "For people who started without a car, what worked and what became difficult? For people who bought a used car quickly, what costs surprised you before or after signing?",
    ],
    replies: [
      {
        id: "reply-10",
        author: "Grace N.",
        avatar: "GN",
        time: "1 day ago",
        body: "Map the exact commute at your real travel time. A 6-mile trip can be easy by car and awkward by transit depending on transfers.",
        usefulCount: 11,
        unusefulCount: 1,
      },
      {
        id: "reply-11",
        author: "Omar B.",
        avatar: "OB",
        time: "20h ago",
        body: "Price insurance before deciding a used car is cheaper. New drivers or new residents can see very different quotes.",
        usefulCount: 7,
        unusefulCount: 0,
      },
    ],
  },
  {
    id: "post-6",
    author: "Lina W.",
    avatar: "LW",
    time: "3 days ago",
    category: "Education",
    title: "How should parents compare ESL support, school enrollment timing, and after-school care?",
    excerpt:
      "We are moving mid-semester and want to understand what questions to ask a district before choosing an apartment...",
    comments: 16,
    views: "720",
    tags: ["Education", "ESL", "Enrollment", "After School"],
    usefulCount: 11,
    unusefulCount: 1,
    body: [
      "We are moving mid-semester and need to understand school enrollment for a child who may need English language support. Housing is not finalized yet, so timing is the hardest part.",
      "I am trying to prepare immunization records, transcripts, proof of address, birth certificate, and any language support documents. I also heard after-school programs can have separate waitlists.",
      "Should we contact districts before signing a lease, or wait until we have an address? I would appreciate parent experiences with ESL placement, enrollment windows, and after-school care.",
    ],
    replies: [
      {
        id: "reply-12",
        author: "Hannah Z.",
        avatar: "HZ",
        time: "2 days ago",
        body: "Ask the district for the exact enrollment checklist before choosing a move-in date. Some documents can take longer to translate or request.",
        usefulCount: 5,
        unusefulCount: 0,
      },
      {
        id: "reply-13",
        author: "Noah F.",
        avatar: "NF",
        time: "1 day ago",
        body: "Check after-school care separately from enrollment. In our district, the school had space but the after-care program had a waitlist.",
        usefulCount: 4,
        unusefulCount: 0,
      },
    ],
  },
  {
    id: "post-7",
    author: "Amara J.",
    avatar: "AJ",
    time: "4 days ago",
    category: "Legal / Immigration",
    title: "What should I organize before a green card consultation with an immigration attorney?",
    excerpt:
      "I am gathering travel history, work records, and family documents before my first legal consultation...",
    comments: 22,
    views: "1.1k",
    tags: ["Legal / Immigration", "Green Card", "Attorney", "Documents"],
    usefulCount: 16,
    unusefulCount: 2,
    body: [
      "I am preparing for a first consultation with an immigration attorney and want to organize my records before the meeting. I know the attorney will give legal advice, but I want to use the appointment time efficiently.",
      "I am gathering travel history, prior status documents, employment records, family documents, tax documents if relevant, and notices from government agencies. I am also writing down dates instead of relying on memory.",
      "For people who have done this, what folder structure helped? I am especially interested in timelines, questions to ask, and how to label documents so the attorney can review them quickly.",
    ],
    replies: [
      {
        id: "reply-14",
        author: "Iris P.",
        avatar: "IP",
        time: "3 days ago",
        body: "Make a one-page timeline of status changes, travel dates, and major filings. It helps the attorney spot gaps quickly.",
        usefulCount: 9,
        unusefulCount: 1,
      },
      {
        id: "reply-15",
        author: "Ben T.",
        avatar: "BT",
        time: "2 days ago",
        body: "Write your questions in priority order. Consultation time goes fast, so start with the decisions that have deadlines.",
        usefulCount: 6,
        unusefulCount: 0,
      },
    ],
  },
];

export function getForumDiscussion(id: string) {
  return FORUM_DISCUSSIONS.find((discussion) => discussion.id === id);
}

export function filterForumDiscussions(
  discussions: ForumDiscussion[],
  searchText: string,
  category: string,
) {
  const normalizedSearch = searchText.trim().toLowerCase();
  const normalizedCategory = category.toLowerCase();

  return discussions.filter((discussion) => {
    const matchesCategory =
      normalizedCategory === "all topics" || discussion.category.toLowerCase() === normalizedCategory;

    const searchableText = [
      discussion.title,
      discussion.excerpt,
      discussion.author,
      discussion.category,
      discussion.tags.join(" "),
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);
    return matchesCategory && matchesSearch;
  });
}

export function createForumDiscussion(input: {
  id?: string;
  title: string;
  category: string;
  body: string;
  author: string;
  userId?: string;
  imageUrls?: string[];
}): ForumDiscussion {
  const author = input.author.trim() || "CaliGuide Member";
  const body = input.body.trim();
  const initials =
    author
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U";

  return {
    id: input.id ?? createForumId(),
    userId: input.userId,
    author,
    avatar: initials,
    time: "Just now",
    category: input.category,
    title: input.title.trim(),
    excerpt: body,
    comments: 0,
    views: "0",
    tags: [input.category, "Community", "New Post"],
    imageUrls: input.imageUrls ?? [],
    body: [
      body,
      "Community members can help more when the post includes the city, timeline, documents already prepared, and the specific decision or next step that needs advice.",
    ],
    replies: [],
    usefulCount: 0,
    unusefulCount: 0,
  };
}

export function getForumReplyCount(discussion: ForumDiscussion) {
  return discussion.replies.length;
}

export function addForumComment(
  discussion: ForumDiscussion,
  input: { userId?: string; author: string; body: string },
): ForumDiscussion {
  const author = input.author.trim() || "CaliGuide Member";
  const body = input.body.trim();

  if (!body) {
    throw new Error("Comment is required");
  }

  return {
    ...discussion,
    comments: discussion.replies.length + 1,
    replies: [
      ...discussion.replies,
      {
        id: createForumId(),
        userId: input.userId,
        author,
        avatar: createInitials(author),
        time: "Just now",
        body,
        usefulCount: 0,
        unusefulCount: 0,
      },
    ],
  };
}

export function removeForumDiscussion(
  discussions: ForumDiscussion[],
  discussionId: string,
  currentUserId: string,
) {
  return discussions.filter((discussion) => discussion.id !== discussionId || discussion.userId !== currentUserId);
}

export function removeForumComment(
  discussion: ForumDiscussion,
  commentId: string,
  currentUserId: string,
): ForumDiscussion {
  const nextReplies = discussion.replies.filter(
    (reply) => reply.id !== commentId || reply.userId !== currentUserId,
  );

  if (nextReplies.length === discussion.replies.length) {
    return discussion;
  }

  return {
    ...discussion,
    comments: nextReplies.length,
    replies: nextReplies,
  };
}

export function mergeForumDiscussions(
  localDiscussions: ForumDiscussion[],
  remoteDiscussions: ForumDiscussion[],
) {
  const remoteIds = new Set(remoteDiscussions.map((discussion) => discussion.id));
  return [
    ...remoteDiscussions,
    ...localDiscussions.filter((discussion) => !remoteIds.has(discussion.id)),
  ];
}

function createForumId() {
  return crypto.randomUUID();
}

export function getUsefulCount(item: { usefulCount?: number; usefulUserIds?: string[] }) {
  return (item.usefulCount ?? 0) + (item.usefulUserIds?.length ?? 0);
}

export function getUnusefulCount(item: { unusefulCount?: number; unusefulUserIds?: string[] }) {
  return (item.unusefulCount ?? 0) + (item.unusefulUserIds?.length ?? 0);
}

export function isUsefulByUser(item: { usefulUserIds?: string[] }, userId: string) {
  return item.usefulUserIds?.includes(userId) ?? false;
}

export function isUnusefulByUser(item: { unusefulUserIds?: string[] }, userId: string) {
  return item.unusefulUserIds?.includes(userId) ?? false;
}

export function toggleDiscussionUseful(discussion: ForumDiscussion, userId: string): ForumDiscussion {
  const willBeUseful = !isUsefulByUser(discussion, userId);

  return {
    ...discussion,
    usefulUserIds: toggleUserId(discussion.usefulUserIds, userId),
    unusefulUserIds: willBeUseful ? removeUserId(discussion.unusefulUserIds, userId) : discussion.unusefulUserIds,
  };
}

export function toggleDiscussionUnuseful(discussion: ForumDiscussion, userId: string): ForumDiscussion {
  const willBeUnuseful = !isUnusefulByUser(discussion, userId);

  return {
    ...discussion,
    unusefulUserIds: toggleUserId(discussion.unusefulUserIds, userId),
    usefulUserIds: willBeUnuseful ? removeUserId(discussion.usefulUserIds, userId) : discussion.usefulUserIds,
  };
}

export function toggleCommentUseful(
  discussion: ForumDiscussion,
  commentId: string,
  userId: string,
): ForumDiscussion {
  return {
    ...discussion,
    replies: discussion.replies.map((reply) =>
      reply.id === commentId
        ? {
            ...reply,
            usefulUserIds: toggleUserId(reply.usefulUserIds, userId),
            unusefulUserIds: !isUsefulByUser(reply, userId)
              ? removeUserId(reply.unusefulUserIds, userId)
              : reply.unusefulUserIds,
          }
        : reply,
    ),
  };
}

export function toggleCommentUnuseful(
  discussion: ForumDiscussion,
  commentId: string,
  userId: string,
): ForumDiscussion {
  return {
    ...discussion,
    replies: discussion.replies.map((reply) =>
      reply.id === commentId
        ? {
            ...reply,
            unusefulUserIds: toggleUserId(reply.unusefulUserIds, userId),
            usefulUserIds: !isUnusefulByUser(reply, userId)
              ? removeUserId(reply.usefulUserIds, userId)
              : reply.usefulUserIds,
          }
        : reply,
    ),
  };
}

function removeUserId(userIds: string[] | undefined, userId: string) {
  return (userIds ?? []).filter((currentUserId) => currentUserId !== userId);
}

function toggleUserId(userIds: string[] | undefined, userId: string) {
  const currentUserIds = userIds ?? [];

  if (currentUserIds.includes(userId)) {
    return currentUserIds.filter((currentUserId) => currentUserId !== userId);
  }

  return [...currentUserIds, userId];
}

function createInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U"
  );
}
