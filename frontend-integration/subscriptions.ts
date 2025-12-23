import { apiRequest } from './config';
import type { SubscriptionData, EmailSubscription, APIResponse, PaginatedResponse } from './types';

export const subscriptionAPI = {
 
  async subscribe(data: SubscriptionData): Promise<APIResponse<EmailSubscription>> {
    return apiRequest<APIResponse<EmailSubscription>>('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

 
  async unsubscribe(token: string): Promise<APIResponse> {
    return apiRequest<APIResponse>(`/subscriptions/unsubscribe/${token}`);
  },

  async getSubscriptions(filters?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
    subscriptionType?: string;
    verified?: boolean;
    search?: string;
    sort?: string;
  }): Promise<PaginatedResponse<EmailSubscription>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<PaginatedResponse<EmailSubscription>>(`/subscriptions${query}`);
  },

 
  async getSubscription(id: string): Promise<APIResponse<EmailSubscription>> {
    return apiRequest<APIResponse<EmailSubscription>>(`/subscriptions/${id}`);
  },

 
  async updateSubscription(
    id: string,
    updates: Partial<EmailSubscription>
  ): Promise<APIResponse<EmailSubscription>> {
    return apiRequest<APIResponse<EmailSubscription>>(`/subscriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },


  async deleteSubscription(id: string): Promise<APIResponse> {
    return apiRequest<APIResponse>(`/subscriptions/${id}`, {
      method: 'DELETE',
    });
  },

 
  async getSubscriptionStats(): Promise<APIResponse<{
    total: number;
    active: number;
    inactive: number;
    today: number;
    byType: Array<{ _id: string; count: number }>;
  }>> {
    return apiRequest<APIResponse<any>>('/subscriptions/stats/summary');
  },

  
  async exportEmails(filters?: {
    subscriptionType?: string;
    isActive?: boolean;
  }): Promise<APIResponse<Array<{ email: string; name: string; type: string }>>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<APIResponse<any>>(`/subscriptions/export/emails${query}`);
  },
};

export function useSubscriptionAPI() {
  return subscriptionAPI;
}
