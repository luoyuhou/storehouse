import React, { useCallback, useEffect, useState } from "react";
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import { post } from "src/lib/http";
import { toast } from "react-toastify";
import { TablePaginationActions } from "src/components/table";

interface QuotaOrder {
  id: number;
  order_id: string;
  store_id: string;
  store_name: string;
  quota_amount: string;
  price: number;
  status: number;
  create_date: string;
}

export function StoreResourceOrder() {
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState(5);
  const [rows, setRows] = useState<number>(0);
  const [data, setData] = useState<QuotaOrder[]>([]);
  const [filtered] = useState<{ id: string; value: unknown }[]>([]);

  const fetchData = useCallback(() => {
    post<{ data: QuotaOrder[]; rows: number; pages: number }>({
      url: "/api/store/resource/pagination",
      payload: { pageNum: page, pageSize, filtered: [], sorted: [] },
    })
      .then((res) => {
        setData(res.data);
        setRows(res.rows);
      })
      .catch((err) => toast.error((err as { message: string }).message));
  }, [page, pageSize, filtered]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChangePage = (_e: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  return (
    <Card>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>订单号</TableCell>
            <TableCell>商铺</TableCell>
            <TableCell>申请额度 (MB)</TableCell>
            <TableCell>金额 (元)</TableCell>
            <TableCell>申请时间</TableCell>
            <TableCell>状态</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.order_id}</TableCell>
              <TableCell>{order.store_name || order.store_id}</TableCell>
              <TableCell>{Number(order.quota_amount) / (1024 * 1024)} MB</TableCell>
              <TableCell>{order.price}</TableCell>
              <TableCell>{new Date(order.create_date).toLocaleString()}</TableCell>
              <TableCell>{order.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TablePagination
            style={{ overflow: "inherit" }}
            rowsPerPageOptions={[5, 10]}
            colSpan={3}
            count={rows}
            rowsPerPage={pageSize}
            page={page}
            labelRowsPerPage="每页行数:"
            onRowsPerPageChange={handleRowsPerPageChange}
            onPageChange={handleChangePage}
            ActionsComponent={TablePaginationActions}
          />
        </TableFooter>
      </Table>
    </Card>
  );
}
