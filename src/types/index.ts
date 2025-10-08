export interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: Date;
}

export interface Project {
  id: string;
  name: string;
  client_name: string | null;
  description: string | null;
  price: number;
  deadline: string | null;
  work_status: "in_progress" | "ready" | "completed";
  payment_status: "paid" | "unpaid" | "pending";
  priority: "high" | "medium" | "low";
  is_archived: boolean;
}
