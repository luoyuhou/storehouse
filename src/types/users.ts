export type UserEntity = {
  id: number;
  user_id?: string;
  avatar: string | null;
  first_name?: string;
  last_name?: string;
  phone: string;
  status: number;
  email: string | null;
  create_date: Date;
  update_date: Date;
};

export type UserSessionType = {
  id: string;
  avatar: string;
  name: string;
  last_name: string;
  first_name: string;
  phone: string;
  email: string | null;
};
