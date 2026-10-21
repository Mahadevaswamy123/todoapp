export type Priority = 'low' | 'medium' | 'high';
export type Category = 'General' | 'Work' | 'Personal' | 'Study' | 'Urgent';
export type SortMode = 'smart' | 'deadline' | 'priority' | 'newest';
export type FilterStatus = 'all' | 'active' | 'completed' | 'high_priority';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dateTime: string | null;
  deadline: string | null;
  priority: Priority;
  category: Category;
  completed: boolean;
  notes?: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
}

export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  CreateTask: undefined;
};
