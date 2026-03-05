export interface StoreServicePlan {
  id: number;
  name: string;
  description?: string | null;
  monthly_fee: number;
  is_active: boolean;
}

export interface StoreServiceSubscription {
  id: number;
  store_id: string;
  store_name?: string;
  plan_id: number;
  start_date: string;
  end_date: string;
  status: number;
  plan: StoreServicePlan;
}

export interface StoreServiceInvoice {
  id: number;
  subscription_id: number;
  month: string;
  start_date: string;
  end_date: string;
  amount: number;
  status: number;
  due_date: string;
  paid_at?: string | null;
  subscription: StoreServiceSubscription;
}

export function formatDate(value?: string | null): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}
