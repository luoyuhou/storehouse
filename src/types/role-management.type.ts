export type AuthType = {
  id: number;
  pid: string;
  auth_id: string;
  side: number;
  path: string;
  method: string;
  status: number;
  create_date?: Date;
  update_date?: Date;
};

export type RoleType = {
  id: number;
  role_id: string;
  role_name: string;
  description: string;
  create_date: Date;
  update_date: Date;
};

export type AuthRoleType = {
  id: number;
  auth_id: string;
  role_id: string;
  status: number;
  create_date: Date;
  update_date: Date;
};

export type UserRoleType = {
  id: string;
  role_id: string;
  user_id: string;
  status: number;
  create_date: Date;
  update_date: Date;
};
