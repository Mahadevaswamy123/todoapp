import type { ApiError, AuthResponse, Category, Priority, Task } from '../types';

const CANDIDATE_URLS = [
  'http://localhost:5000/api',    // USB cable with adb reverse / iOS
  'http://10.0.2.2:5000/api',     // Android Studio Emulator
  'http://192.168.1.33:5000/api', // Wi-Fi LAN
];

let activeBaseUrl = CANDIDATE_URLS[0];
let tokenProvider: () => string | null = () => null;

export function setTokenProvider(provider: () => string | null): void {
  tokenProvider = provider;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = tokenProvider();
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const urlsToTry = [activeBaseUrl, ...CANDIDATE_URLS.filter((u) => u !== activeBaseUrl)];
  let lastError: Error | null = null;

  for (const baseUrl of urlsToTry) {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers,
      });

      const payload: unknown = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = (payload as ApiError)?.message || `Request failed (${response.status})`;
        throw new Error(message);
      }
      activeBaseUrl = baseUrl;
      return payload as T;
    } catch (err: unknown) {
      const error = err as Error;
      if (error?.message && !error.message.includes('Network request failed') && !error.message.includes('Failed to fetch')) {
        throw error;
      }
      lastError = error;
    }
  }

  throw lastError || new Error('Cannot reach backend server. Ensure backend is running.');
}

export const api = {
  register: (name: string, email: string, password: string) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getTasks: async () => (await request<{ tasks: Task[] }>('/tasks')).tasks,

  createTask: async (input: {
    title: string;
    description?: string;
    dateTime?: string | null;
    deadline?: string | null;
    priority: Priority;
    category?: Category;
  }) =>
    (
      await request<{ task: Task }>('/tasks', {
        method: 'POST',
        body: JSON.stringify(input),
      })
    ).task,

  updateTask: async (
    id: string,
    input: Partial<Pick<Task, 'completed' | 'title' | 'description' | 'dateTime' | 'deadline' | 'priority' | 'category'>>
  ) =>
    (
      await request<{ task: Task }>(`/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      })
    ).task,

  deleteTask: (id: string) =>
    request<{ message: string }>(`/tasks/${id}`, {
      method: 'DELETE',
    }),
};
