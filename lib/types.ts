export interface RegistrationFormData {
  // Creator
  creatorEmail: string;
  creatorName: string;
  creatorUsername: string;
  creatorPassword: string;
  creatorEmailVerified: boolean;
  
  // Fulfiller
  fulfillerEmail: string;
  fulfillerName: string;
  fulfillerUsername: string;
  fulfillerPassword: string;
  fulfillerEmailVerified: boolean;
}

export type UserRole = 'creator' | 'fulfiller';

export interface Dream {
  id: number;
  couple_id: string;
  created_by: string;
  title: string;
  description: string | null;
  category: string | null;
  estimated_date: string | null;
  estimated_cost: number | null;
  status: 'pending' | 'active' | 'fulfillment_requested' | 'completed';
  created_at: string;
  activated_at: string | null;
  activated_by: string | null;
  completed_at: string | null;
  completed_by: string | null;
}

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  email: string;
  couple_id: string;
  role: UserRole;
}

export interface User {
  id: string;
  username: string;
  full_name: string;
  email: string;
  role: UserRole;
  couple_id: string;
}