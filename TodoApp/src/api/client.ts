import type { ApiError, AuthResponse, Category, Priority, Task } from '../types';

// Use 10.0.2.2 for Android emulator to reach host machine, localhost for iOS
const API_BASE_URL = "https://poor-cows-work.loca.lt/api"

let tokenProvider: () => string | null = () => null;

export function setTokenProvider(provider: () => string | null): void {
  tokenProvider = provider;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = tokenProvider();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const payload: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = (payload as ApiError)?.message || `Request failed (${response.status})`;
    throw new Error(message);
  }
  return payload as T;
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
