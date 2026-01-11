import React, { useEffect, useState, useCallback } from "react";
import { StoreOrderTable } from "src/sections/store/order/order-table";

function StoreOrderAllTable() {
  return (
    <StoreOrderTable
      onDeselectAll={() => {}}
      onDeselectOne={() => {}}
      onSelectAll={() => {}}
      onSelectOne={() => {}}
      selected={[]}
    />
  );
}

export default StoreOrderAllTable;
