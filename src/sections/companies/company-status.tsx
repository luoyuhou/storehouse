import React from "react";
import { Typography } from "@mui/material";
import { EStoreStatusConst } from "src/constant/store.const";

export function CompanyStatus(props: { status: EStoreStatusConst }) {
  const { status } = props;
  if (status === EStoreStatusConst.FROZEN) {
    return (
      <Typography align="center" variant="body1" fontSize="12px" color="red">
        禁用
      </Typography>
    );
  }

  if (status === EStoreStatusConst.REJECTED) {
    return (
      <Typography align="center" variant="body1" fontSize="12px" color="darkorange">
        拒绝
      </Typography>
    );
  }

  if (status === EStoreStatusConst.CANCEL) {
    return (
      <Typography align="center" variant="body1" fontSize="12px" color="orange">
        取消
      </Typography>
    );
  }

  if (status === EStoreStatusConst.PENDING) {
    return (
      <Typography align="center" variant="body1" fontSize="12px" color="grey">
        等待审核
      </Typography>
    );
  }

  if (status === EStoreStatusConst.PREVIEW) {
    return (
      <Typography align="center" variant="body1" fontSize="12px" color="skyblue">
        预览中
      </Typography>
    );
  }

  if (status === EStoreStatusConst.REVIEWED) {
    return (
      <Typography align="center" variant="body1" fontSize="12px" color="blue">
        已预览
      </Typography>
    );
  }

  if (status === EStoreStatusConst.APPROVED) {
    return (
      <Typography align="center" variant="body1" fontSize="12px" color="green">
        通过
      </Typography>
    );
  }

  return (
    <Typography align="center" variant="body1" fontSize="12px" color="yellow">
      {status}
    </Typography>
  );
}
