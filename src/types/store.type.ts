export type StoreType = {
  store_id: string;
  store_name: string;
  province: string;
  city: string;
  area: string;
  town: string;
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
