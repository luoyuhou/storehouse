import React from "react";
import { Typography } from "@mui/material";

export function StoreServiceSubscriptionCellRender({ value }: { value: number }) {
  if (value === 1) {
    return <Typography color="green">生效中</Typography>;
  }

  if (value === 2) {
    return <Typography color="green">已过期</Typography>;
  }

  return <Typography color="red">已终止</Typography>;
}

export function StoreServiceStatusCellRender({ value }: { value: number }) {
  if (value === 0) {
    return <Typography color="orange">待支付</Typography>;
  }
  if (value === 1) {
    return <Typography color="green">待支付</Typography>;
  }
  if (value === 2) {
    return <Typography color="red">逾期</Typography>;
  }
  return <Typography color="grey">已取消</Typography>;
}
