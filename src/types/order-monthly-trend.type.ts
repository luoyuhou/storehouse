interface MonthlyTrendDayPoint {
  date: string; // YYYY-MM-DD
  totalOrders: number;
  totalAmount: number; // 分
}

export interface MonthlyTrendResponse {
  month: string; // YYYY-MM
  startDate: string;
  endDate: string;
  totalOrders: number;
  totalAmount: number; // 分
  days: MonthlyTrendDayPoint[];
}
