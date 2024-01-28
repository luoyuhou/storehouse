export type GoodsType = {
  id: number;
  store_id: string;
  store_name?: string;
  category_id: string;
  category_name?: string;
  goods_id: string;
  name: string;
  description: string;
  status: number;
  create_date: string;
  update_date: string;
};

export type GoodsVersionType = {
  id: number;
  version_id: string;
  goods_id: string;
  version_number: string | null;
  bar_code: string | null;
  count: number;
  price: number;
  unit_name: string;
  supplier: string | null;
  status: number;
  create_date: string;
  update_date: string;
};

export const InitialGoodsVersion = () => {
  const version: GoodsVersionType = {
    id: 0,
    version_id: "",
    goods_id: "",
    version_number: null,
    bar_code: null,
    count: 0,
    price: 0,
    unit_name: "",
    supplier: null,
    status: 0,
    create_date: "",
    update_date: "",
  };
  return version;
};
