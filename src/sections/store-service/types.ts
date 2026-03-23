export interface StoreServicePlan {
  id: number;
  plan_id: string;
  name: string;
  description?: string | null;
  monthly_fee: number;
  max_subscriptions?: number | null; // null 表示无限次，正整数表示最大订阅次数
  is_active: boolean;
  current_subscriptions?: number; // 当前已订阅次数
}

export interface StoreServiceSubscription {
  id: number;
  store_id: string;
  store_name?: string;
  plan_id: string;
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
