export type StoreType = {
  id: number;
  store_id: string;
  store_name: string;
  province: string;
  province_name?: string;
  city: string;
  city_name?: string;
  area: string;
  area_name?: string;
  town: string;
  town_name?: string;
  address: string;
  logo?: string;
  wechat_qr_url?: string | null;
  alipay_qr_url?: string | null;

  status: number;

  id_code: string;
  id_name: string;

  phone: string;
};

export type StoryHistoryType = {
  id: number;
  store_id: string;
  action_type: number;
  action_content: string;
  action_user_id: string;
  action_date: string;
  payload?: string;
  create_date: string;
  update_date: string;
};

export type UserOrderType = {
  id: number;
  order_id: string;
  user_id: string;
  store_id: string;
  status: 0 | 1 | 2 | 3 | 4 | 5;
  stage: 1 | 2 | 3;
  payment_method?: "online_qr" | "cod" | "pickup_pay";
  pay_status?: 0 | 1;
  paid_at?: string | null;
  pay_proof_url?: string | null;
  recipient: string;
  money: number;
  phone: string;
  province: string;
  city: string;
  area: string;
  town: string;
  address: string;
  delivery_date: string;
  create_date: string;

  _store?: {
    store_name: string;
  };
};

export interface StoreSubscriptionPlan {
  id: number;
  plan_id: string;
  name: string;
  description: string;
  monthly_fee: number;
  max_subscriptions?: number | null; // null 表示无限次，正整数表示最大订阅次数
  current_subscriptions?: number; // 当前已订阅次数
}
