// 商家结算
export interface StoreSettlement {
  id: number;
  settlement_id: string;
  store_id: string;
  month: string;
  total_orders: number;
  total_amount: number;
  total_income: number;
  status: number; // 0待确认, 1已确认, 2已结算
  start_date: string;
  end_date: string;
  settled_at?: string;
  create_date: string;
  update_date: string;
}

export interface StoreSettlementDetail {
  id: number;
  settlement_id: string;
  order_id: string;
  amount: number;
  order_stage: number;
  pay_status: number;
  create_date: string;
}

export interface StoreSettlementWithDetails extends StoreSettlement {
  store_settlement_detail: StoreSettlementDetail[];
  store?: {
    store_id: string;
    store_name: string;
    id_name: string;
  };
}

// 平台结算
export interface PlatformSettlement {
  id: number;
  settlement_id: string;
  month: string;
  total_subscription_fee: number;
  total_resource_fee: number;
  total_order_service_fee: number;
  total_amount: number;
  status: number;
  start_date: string;
  end_date: string;
  settled_at?: string;
  create_date: string;
  update_date: string;
}

export interface PlatformSettlementDetail {
  id: number;
  settlement_id: string;
  type: number; // 1订阅费用, 2资源购买, 3订单服务费
  ref_id: string;
  store_id: string;
  amount: number;
  remark?: string;
  create_date: string;
}

export interface PlatformSettlementWithDetails extends PlatformSettlement {
  platform_settlement_detail: PlatformSettlementDetail[];
  summary: {
    subscription: PlatformSettlementDetail[];
    resource: PlatformSettlementDetail[];
    orderService: PlatformSettlementDetail[];
  };
}

// 结算状态枚举
// eslint-disable-next-line @typescript-eslint/naming-convention
export enum E_SETTLEMENT_STATUS {
  pending = 0, // 待确认
  confirmed = 1, // 已确认
  settled = 2, // 已结算
}

export const SETTLEMENT_STATUS_LABELS = {
  [E_SETTLEMENT_STATUS.pending]: "待确认",
  [E_SETTLEMENT_STATUS.confirmed]: "已确认",
  [E_SETTLEMENT_STATUS.settled]: "已结算",
};

// 平台结算明细类型
// eslint-disable-next-line @typescript-eslint/naming-convention
export enum E_PLATFORM_SETTLEMENT_TYPE {
  subscription = 1,
  resource = 2,
  order_service = 3,
}

export const PLATFORM_SETTLEMENT_TYPE_LABELS = {
  [E_PLATFORM_SETTLEMENT_TYPE.subscription]: "订阅费用",
  [E_PLATFORM_SETTLEMENT_TYPE.resource]: "资源购买",
  [E_PLATFORM_SETTLEMENT_TYPE.order_service]: "订单服务费",
};
