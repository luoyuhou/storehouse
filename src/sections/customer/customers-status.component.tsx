import React from "react";
import { ECustomerStatus } from "src/constant/customers";

export default function CustomersStatusComponent({ status }: { status: number }) {
  if (status === ECustomerStatus.active) {
    return <span className="text-green-700">Active</span>;
  }

  if (status === ECustomerStatus.rejected) {
    return <span className="text-orange-600">Rejected</span>;
  }

  return null;
}
