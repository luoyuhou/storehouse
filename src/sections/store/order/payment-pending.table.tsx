import React from "react";
import { StoreOrderTable } from "src/sections/store/order/order-table";

function StoreOrderPaymentPendingTable(props: { setTrigger: () => void }) {
  return (
    <StoreOrderTable
      onDeselectAll={() => {}}
      onDeselectOne={() => {}}
      onSelectAll={() => {}}
      onSelectOne={() => {}}
      selected={[]}
      setTrigger={props.setTrigger}
      // 支付状态为未收款的订单
      defaultFiltered={[{ id: "pay_status", value: 0 }]}
    />
  );
}

export default StoreOrderPaymentPendingTable;
