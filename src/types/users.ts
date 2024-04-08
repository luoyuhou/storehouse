export type UserEntity = {
  user_id?: string;
  avatar: string | null;
  first_name?: string;
  last_name?: string;
  phone: string;
  email: string | null;
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
