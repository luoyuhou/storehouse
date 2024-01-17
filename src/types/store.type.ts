export type StoreType = {
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
