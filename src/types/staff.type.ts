export interface StaffType {
  staff_id: string;
  store_id: string;
  name: string;
  phone: string;
  user_id?: string;
  status: number; // 1: 正常, 0: 禁用
  create_date: string;
  update_date: string;
}
