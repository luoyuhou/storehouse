import React from "react";
import PropTypes from "prop-types";
import { format } from "date-fns";
import {
  Box,
  Card,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import { Scrollbar } from "src/components/scrollbar";
import { UserOrderType } from "src/types/store.type";

export function StoreOrderTable(props: {
  count?: number;
  items?: UserOrderType[];
  onDeselectAll: () => void;
  onDeselectOne: (id: string) => void;
  onPageChange: (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => void;
  onRowsPerPageChange: (event: { target: { value: React.SetStateAction<number> } }) => void;
  onSelectAll: () => void;
  onSelectOne: (id: string) => void;
  page: number;
  rowsPerPage: number;
  selected: string[];
}) {
  const {
    count = 0,
    items = [],
    onDeselectAll,
    onDeselectOne,
    onPageChange = () => {},
    onRowsPerPageChange,
    onSelectAll,
    onSelectOne,
    page = 0,
    rowsPerPage = 0,
    selected = [],
  } = props;

  const selectedSome = selected.length > 0 && selected.length < items.length;
  const selectedAll = items.length > 0 && selected.length === items.length;

  return (
    <Card>
      <Scrollbar>
        <Box sx={{ minWidth: 800 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedAll}
                    indeterminate={selectedSome}
                    onChange={(event) => {
                      if (event.target.checked) {
                        onSelectAll?.();
                      } else {
                        onDeselectAll?.();
                      }
                    }}
                  />
                </TableCell>
                <TableCell>商铺</TableCell>
                <TableCell>订单 ID</TableCell>
                <TableCell>金额</TableCell>
                <TableCell>下单时间</TableCell>
                <TableCell>状态</TableCell>
                <TableCell>进度</TableCell>
                <TableCell>用户</TableCell>
                <TableCell>联系方式</TableCell>
                <TableCell>送货时间</TableCell>
                <TableCell>送货地址</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((order) => {
                const isSelected = selected.includes(order.order_id);

                return (
                  <TableRow hover key={order.id} selected={isSelected}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={(event) => {
                          if (event.target.checked) {
                            onSelectOne?.(order.order_id);
                          } else {
                            onDeselectOne?.(order.order_id);
                          }
                        }}
                      />
                    </TableCell>
                    {/* eslint-disable-next-line no-underscore-dangle */}
                    <TableCell>{order?._store?.store_name}</TableCell>
                    <TableCell>{order.order_id}</TableCell>
                    <TableCell>{(order.money / 100).toFixed(2)}</TableCell>
                    <TableCell>
                      {format(new Date(order.create_date), "yyyy-MM-dd HH:mm:ss")}
                    </TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell>{order.stage}</TableCell>
                    {/* eslint-disable-next-line no-underscore-dangle */}
                    <TableCell>{`${order?._user?.first_name}${order?._user?.last_name}`}</TableCell>
                    <TableCell>{order.phone}</TableCell>
                    <TableCell>
                      {format(new Date(order.delivery_date), "yyyy-MM-dd HH:mm:ss")}
                    </TableCell>
                    <TableCell>
                      {order.province}
                      {order.city}
                      {order.area}
                      {order.town}
                      {order.address}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      </Scrollbar>
      <TablePagination
        component="div"
        count={count}
        onPageChange={onPageChange}
        // onRowsPerPageChange={onRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Card>
  );
}

StoreOrderTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  onDeselectAll: PropTypes.func,
  onDeselectOne: PropTypes.func,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  onSelectAll: PropTypes.func,
  onSelectOne: PropTypes.func,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  selected: PropTypes.array,
};
