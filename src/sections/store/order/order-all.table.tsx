import React, { useEffect, useState } from "react";
import { StoreOrderTable } from "src/sections/store/order/order-table";
import { post } from "src/lib/http";
import { toast } from "react-toastify";
import { UserOrderType } from "src/types/store.type";

function StoreOrderAllTable() {
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(5);
  const [rows, setRows] = React.useState(0);
  const [data, setData] = React.useState<UserOrderType[]>([]);
  const [filtered, setFiltered] = React.useState<{ id: string; value: unknown }[]>([]);

  useEffect(() => {
    console.log(111111);
    post<{ pages: number; rows: number; data: UserOrderType[] }>({
      url: "/api/store/order/pagination",
      payload: { pageNum: page, pageSize, filtered, sorted: [] },
    })
      .then((res) => {
        setRows(res.rows);
        setData(res.data);
      })
      .catch((err) => toast.error(JSON.stringify(err.message)));
  }, [page, pageSize, filtered]);

  return (
    <StoreOrderTable
      onDeselectAll={() => {}}
      onDeselectOne={() => {}}
      onPageChange={() => {}}
      onRowsPerPageChange={() => {}}
      onSelectAll={() => {}}
      onSelectOne={() => {}}
      page={page}
      items={data}
      rowsPerPage={rows}
      selected={[]}
    />
  );
}

export default StoreOrderAllTable;
