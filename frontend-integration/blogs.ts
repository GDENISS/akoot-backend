import { apiRequest } from './config';
import type { Blog, BlogFilters, PaginatedResponse, APIResponse } from './types';

export const blogAPI = {

  async getBlogs(filters?: BlogFilters): Promise<PaginatedResponse<Blog>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<PaginatedResponse<Blog>>(`/blogs${query}`);
  },

  async getBlog(idOrSlug: string): Promise<APIResponse<Blog>> {
    return apiRequest<APIResponse<Blog>>(`/blogs/${idOrSlug}`);
  },


  async createBlog(blogData: Partial<Blog>): Promise<APIResponse<Blog>> {
    return apiRequest<APIResponse<Blog>>('/blogs', {
      method: 'POST',
      body: JSON.stringify(blogData),
    });
  },


  async updateBlog(id: string, blogData: Partial<Blog>): Promise<APIResponse<Blog>> {
    return apiRequest<APIResponse<Blog>>(`/blogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(blogData),
    });
  },

  async deleteBlog(id: string): Promise<APIResponse> {
    return apiRequest<APIResponse>(`/blogs/${id}`, {
      method: 'DELETE',
    });
  },

  async likeBlog(id: string): Promise<APIResponse<{ likes: number }>> {
    return apiRequest<APIResponse<{ likes: number }>>(`/blogs/${id}/like`, {
      method: 'PUT',
    });
  },


  async getCategories(): Promise<APIResponse<string[]>> {
    return apiRequest<APIResponse<string[]>>('/blogs/categories/list');
  },

  async getPopularTags(): Promise<APIResponse<Array<{ _id: string; count: number }>>> {
    return apiRequest<APIResponse<Array<{ _id: string; count: number }>>>('/blogs/tags/popular');
  },
};

export function useBlogAPI() {
  return blogAPI;
}
