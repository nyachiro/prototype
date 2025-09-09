export interface Claim {
  id: string;
  content: string;
  status: "pending" | "true" | "false" | "misleading" | "satire" | "needs-context";
  submittedAt: string;
  verdict?: string;
  explanation?: string;
  sourceUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  category: ClaimCategory;
  submittedBy: string;
  verifiedBy?: string;
  priority: "low" | "medium" | "high" | "urgent";
  sources?: string[];
  references?: string[];
  tags?: string[];
  views?: number;
  trending?: boolean;
  likes?: number;
  shares?: number;
  approved?: boolean;
  bookmarkedBy?: string[];
  aiAnalyzed?: boolean;
  aiPendingApproval?: boolean;
  publishedToFeed?: boolean;
  duplicateOf?: string;
  duplicateCount?: number;
}

export type ClaimCategory = 
  | "elections" 
  | "governance" 
  | "health" 
  | "security" 
  | "economy" 
  | "education" 
  | "environment" 
  | "social"
  | "technology"
  | "other";

export interface Notification {
  id: string;
  userId: string;
  claimId: string;
  type: "verdict_published" | "claim_approved" | "claim_rejected" | "trending";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  authorId: string;
  publishedAt: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  featured: boolean;
  status: "draft" | "published" | "pending_approval";
  likes?: number;
  shares?: number;
  comments?: Comment[];
  viewCount?: number;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  likes?: number;
}

export interface TrendingTopic {
  id: string;
  title: string;
  claimCount: number;
  lastUpdated: string;
  category: ClaimCategory;
  verified?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "fact-checker";
  points: number;
  badges: string[];
  claimsSubmitted: number;
  claimsVerified: number;
  joinedAt: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  category: ClaimCategory;
  points: number;
  completedBy: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}