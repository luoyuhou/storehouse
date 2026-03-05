import React from "react";
import { Button, SvgIcon } from "@mui/material";
import ArrowPathIcon from "@heroicons/react/24/solid/ArrowPathIcon";

export interface RefreshButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
}

export function RefreshButton({
  onClick,
  loading = false,
  disabled = false,
  label = "刷新",
}: RefreshButtonProps) {
  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={
        <SvgIcon fontSize="small">
          <ArrowPathIcon />
        </SvgIcon>
      }
      onClick={onClick}
      disabled={disabled || loading}
      sx={{ minWidth: 120 }}
    >
      {loading ? "加载中..." : label}
    </Button>
  );
}
