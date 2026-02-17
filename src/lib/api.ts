import type { Article, Review, Reviewer, DashboardStats, ReviewQueueItem } from './types';
import { mockArticles, mockReviewer, mockReviews, mockReviewQueue, mockDashboardStats } from './mockData';

// Simulate network delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export async function getArticles(): Promise<Article[]> {
  await delay();
  return mockArticles;
}

export async function getArticleById(id: string): Promise<Article | undefined> {
  await delay();
  return mockArticles.find(a => a.id === id);
}

export async function getReviewer(): Promise<Reviewer> {
  await delay();
  return mockReviewer;
}

export async function getReviewQueue(): Promise<ReviewQueueItem[]> {
  await delay();
  return mockReviewQueue;
}

export async function submitReview(review: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
  await delay(500);
  const newReview: Review = {
    ...review,
    id: `rev${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  mockReviews.push(newReview);
  return newReview;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await delay();
  return mockDashboardStats;
}

export async function getReviews(): Promise<Review[]> {
  await delay();
  return mockReviews;
}
