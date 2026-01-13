import React from "react";
import { StoreOrderTable } from "src/sections/store/order/order-table";

function StoreOrderPendingTable(props: { setTrigger: () => void }) {
  return (
    <StoreOrderTable
      onDeselectAll={() => {}}
      onDeselectOne={() => {}}
      onSelectAll={() => {}}
      onSelectOne={() => {}}
      selected={[]}
      setTrigger={props.setTrigger}
      defaultFiltered={[{ id: "stage", value: 1 }]}
    />
  );
}

export default StoreOrderPendingTable;
