import React, { useState } from "react";
import { StoreOrderTable } from "src/sections/store/order/order-table";

function StoreOrderPendingTable() {
  return (
    <StoreOrderTable
      onDeselectAll={() => {}}
      onDeselectOne={() => {}}
      onSelectAll={() => {}}
      onSelectOne={() => {}}
      selected={[]}
      defaultFiltered={[{ id: "stage", value: 1 }]}
    />
  );
}

export default StoreOrderPendingTable;
