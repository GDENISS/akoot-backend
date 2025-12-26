const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiConfig = {
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${apiConfig.baseURL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...apiConfig.headers,
      ...options?.headers,
    },
  };

  // Create an AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), apiConfig.timeout);

  try {
    const response = await fetch(url, {
      ...config,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'An error occurred');
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please check your connection.');
      }
      throw error;
    }
    throw new Error('Network error occurred');
  }
}

export async function checkHealth() {
  const url = API_URL.replace('/api', '/health');
  const response = await fetch(url);
  return response.json();
}
