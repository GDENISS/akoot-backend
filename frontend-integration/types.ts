// TypeScript Types for API Responses

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  count: number;
  total: number;
  page: number;
  pages: number;
}

// Blog Types
export interface Blog {
  _id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  author: {
    name: string;
    email?: string;
  };
  category: 'Technology' | 'Business' | 'Startup' | 'Development' | 'Design' | 'Marketing' | 'Other';
  tags: string[];
  featuredImage?: string;
  images?: string[];
  published: boolean;
  featured: boolean;
  views: number;
  likes: number;
  metaTitle?: string;
  metaDescription?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogFilters {
  page?: number;
  limit?: number;
  category?: string;
  tags?: string;
  search?: string;
  published?: boolean;
  featured?: boolean;
  sort?: string;
}

// Contact Types
export interface ContactSubmission {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  company?: string;
}

export interface Contact extends ContactSubmission {
  _id: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  ipAddress?: string;
  userAgent?: string;
  repliedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Subscription Types
export interface SubscriptionData {
  email: string;
  name?: string;
  subscriptionType?: 'newsletter' | 'blog_updates' | 'product_updates' | 'all';
  source?: 'website' | 'blog' | 'landing_page' | 'popup' | 'other';
}

export interface EmailSubscription extends SubscriptionData {
  _id: string;
  isActive: boolean;
  preferences: {
    frequency: 'daily' | 'weekly' | 'monthly';
    categories: string[];
  };
  verified: boolean;
  verifiedAt?: string;
  unsubscribedAt?: string;
  unsubscribeToken?: string;
  createdAt: string;
  updatedAt: string;
}
