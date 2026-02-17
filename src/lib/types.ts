export interface Article {
  id: string;
  headline: string;
  publisher: string;
  date: string;
  content: string;
  politicalLeaning: number; // -1 (left) to 1 (right)
  emotionalIntensity: number; // 0 to 1
  tribalActivation: number; // 0 to 1
  threatSignal: number; // 0 to 1
  sensationalism: number; // 0 to 1
  groupConflict: number; // 0 to 1
  biasExplanation: string;
  behaviouralAnalysis: string;
  highlightedSentences: string[];
}

export interface Review {
  id: string;
  articleId: string;
  reviewerId: string;
  political: number;
  intensity: number;
  sensationalism: number;
  threat: number;
  groupConflict: number;
  comment: string;
  highlightedSentence: string;
  createdAt: string;
}

export interface Reviewer {
  id: string;
  name: string;
  email: string;
  reviewCount: number;
  accuracy: number;
  joinedAt: string;
}

export interface DashboardStats {
  totalArticles: number;
  totalReviews: number;
  avgPoliticalLeaning: number;
  avgEmotionalIntensity: number;
  avgTribalActivation: number;
  reviewerCount: number;
  biasDistribution: { label: string; value: number; color: string }[];
  intensityDistribution: { range: string; count: number }[];
  tribalDistribution: { level: string; count: number }[];
  timelineData: { date: string; articles: number; avgBias: number }[];
}

export interface ReviewQueueItem {
  id: string;
  article: Article;
  aiPolitical: number;
  aiIntensity: number;
  aiTribal: number;
  priority: 'high' | 'medium' | 'low';
}
