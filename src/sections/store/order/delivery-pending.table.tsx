import React from "react";
import { StoreOrderTable } from "src/sections/store/order/order-table";

function StoreOrderDeliveryTable(props: { setTrigger: () => void }) {
  return (
    <StoreOrderTable
      onDeselectAll={() => {}}
      onDeselectOne={() => {}}
      onSelectAll={() => {}}
      onSelectOne={() => {}}
      selected={[]}
      setTrigger={props.setTrigger}
      defaultFiltered={[{ id: "stage", value: 3 }]}
    />
  );
}

export default StoreOrderDeliveryTable;
