import React from "react";
import { StoreOrderTable } from "src/sections/store/order/order-table";

function StoreOrderAcceptTable(props: { setTrigger: () => void }) {
  return (
    <StoreOrderTable
      onDeselectAll={() => {}}
      onDeselectOne={() => {}}
      onSelectAll={() => {}}
      onSelectOne={() => {}}
      selected={[]}
      setTrigger={props.setTrigger}
      defaultFiltered={[{ id: "stage", value: 2 }]}
    />
  );
}

export default StoreOrderAcceptTable;
