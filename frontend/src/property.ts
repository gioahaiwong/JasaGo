// Type untuk User
export type User = {
  id: number;
  name: string;
  email: string;
  role: "client" | "provider" | "admin";
  created_at?: string;
};

// Type untuk Service
export type Service = {
  id: number;
  title: string;
  price: number;
  category: string;
  location: string;
  provider_id: number;
  provider_name: string;
  is_active: number;
  created_at?: string;
};

// Type untuk Order
export type Order = {
  id: number;
  service_id: number;
  client_id: number;
  provider_id: number;
  status: "pending" | "accepted" | "completed" | "cancelled";
  payment_status: "unpaid" | "pending" | "paid";
  requested_date: string;
  created_at: string;
  service_title?: string;
};

// Type untuk Payment
export type Payment = {
  id: number;
  order_id: number;
  amount: number;
  status: "pending" | "waiting_confirmation" | "paid" | "failed";
  proof_url: string | null;
  paid_at: string | null;
};

// Type untuk Review
export type Review = {
  id: number;
  orders_id: number;
  rating: number;
  comment: string;
  created_at: string;
};

// Type untuk Props Komponen
export type ServiceCardProps = {
  service: Service;
  onViewDetails?: (id: number) => void;
};

export type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
};
