import React, { useEffect, useState, useCallback } from "react";
import { StoreOrderTable } from "src/sections/store/order/order-table";
import { UserOrderType } from "src/types/store.type";
import { post } from "src/lib/http";
import { toast } from "react-toastify";

function StoreOrderFinishedTable() {
  return (
    <StoreOrderTable
      onDeselectAll={() => {}}
      onDeselectOne={() => {}}
      onSelectAll={() => {}}
      onSelectOne={() => {}}
      selected={[]}
      defaultFiltered={[{ id: "stage", value: 4 }]}
    />
  );
}

export default StoreOrderFinishedTable;
