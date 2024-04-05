import React from "react";
import { StoreOrderTable } from "src/sections/store/order/order-table";

function StoreOrderPendingTable() {
  return (
    <StoreOrderTable
      onDeselectAll={() => {}}
      onDeselectOne={() => {}}
      onPageChange={() => {}}
      onRowsPerPageChange={() => {}}
      onSelectAll={() => {}}
      onSelectOne={() => {}}
      page={0}
      rowsPerPage={0}
      selected={[]}
    />
  );
}

export default StoreOrderPendingTable;
