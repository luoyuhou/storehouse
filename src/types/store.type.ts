export type StoreType = {
  store_id: string;
  store_name: string;
  province: string;
  city: string;
  area: string;
  town: string;

  status: number;
};

export type StoryHistoryType = {
  id: number;
  store_id: string;
  action_type: number;
  action_content: string;
  applicant_user_id: string;
  applicant_date: string;
  replient_user_id: string;
  replient_date: string;
  replient_content: string;
  create_date: string;
  update_date: string;
};
