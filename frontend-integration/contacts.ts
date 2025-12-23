import { apiRequest } from './config';
import type { ContactSubmission, Contact, APIResponse, PaginatedResponse } from './types';

export const contactAPI = {
  
  async submitContact(contactData: ContactSubmission): Promise<APIResponse<Contact>> {
    return apiRequest<APIResponse<Contact>>('/contacts', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  },

  async getContacts(filters?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    sort?: string;
  }): Promise<PaginatedResponse<Contact>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<PaginatedResponse<Contact>>(`/contacts${query}`);
  },


  async getContact(id: string): Promise<APIResponse<Contact>> {
    return apiRequest<APIResponse<Contact>>(`/contacts/${id}`);
  },


  async updateContact(
    id: string,
    updates: { status?: string; notes?: string }
  ): Promise<APIResponse<Contact>> {
    return apiRequest<APIResponse<Contact>>(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },


  async deleteContact(id: string): Promise<APIResponse> {
    return apiRequest<APIResponse>(`/contacts/${id}`, {
      method: 'DELETE',
    });
  },

  async getContactStats(): Promise<APIResponse<{
    total: number;
    today: number;
    byStatus: Array<{ _id: string; count: number }>;
  }>> {
    return apiRequest<APIResponse<any>>('/contacts/stats/summary');
  },
};


export function useContactAPI() {
  return contactAPI;
}
