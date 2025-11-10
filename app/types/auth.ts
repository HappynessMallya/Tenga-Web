export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'customer' | 'vendor' | 'delivery_agent' | 'admin';
  avatar_url?: string;
  is_active: boolean;
  is_verified: boolean;
  last_seen?: string;
  created_at: string;
  updated_at: string;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: 'customer' | 'vendor' | 'delivery_agent';
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user: User | null;
  session?: any; // Supabase session object
  error?: string;
  message?: string;
}
