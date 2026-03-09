import React from "react";
import { TextField } from "@mui/material";

export interface MonthSelectorProps {
  month: string;
  onChange: (month: string) => void;
  disabled?: boolean;
}

export function MonthSelector({ month, onChange, disabled }: MonthSelectorProps) {
  return (
    <TextField
      label="月份"
      type="month"
      size="small"
      value={month}
      onChange={(e) => onChange(e.target.value)}
      InputLabelProps={{ shrink: true }}
      disabled={disabled}
      helperText={!month ? "请选择月份" : ""}
      sx={{ minWidth: 200 }}
    />
  );
}
