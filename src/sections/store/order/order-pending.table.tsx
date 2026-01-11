import React, { useEffect, useState } from "react";
import { StoreOrderTable } from "src/sections/store/order/order-table";
import { UserOrderType } from "src/types/store.type";
import { post } from "src/lib/http";
import { toast } from "react-toastify";

function StoreOrderPendingTable() {
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(5);
  const [rows, setRows] = React.useState(0);
  const [data, setData] = React.useState<UserOrderType[]>([]);
  const [filtered, setFiltered] = React.useState<{ id: string; value: unknown }[]>([]);

  useEffect(() => {
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

export default StoreOrderPendingTable;
