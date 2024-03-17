import { Box } from "@mui/material";
import React, { useState } from "react";
import { GridColDef } from "@mui/x-data-grid";
import { EditableTable } from "src/components/table/editable.table";
import {
  AUTH_METHOD_OPTIONS,
  AUTH_PID_OPTIONS,
  AUTH_STATUS_OPTIONS,
  AUTH_TYPE_OPTIONS,
} from "src/constant/role-management.const";
import { AuthType } from "src/types/role-management.type";

const initialEmptyAuth: AuthType = {
  id: 0,
  pid: "0",
  auth_id: "",
  side: 0,
  path: "",
  method: "",
  status: 1,
};

export function AuthForRoleManagement() {
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const columns: GridColDef[] = [
    {
      field: "pid",
      headerName: "父级",
      // width: 180,
      editable: true,
      type: "singleSelect",
      valueOptions: AUTH_PID_OPTIONS,
      cellClassName: "basis-1/6",
      flex: 1,
    },
    {
      field: "side",
      headerName: "UI / API",
      // type: "number",
      // width: 80,
      editable: true,
      type: "singleSelect",
      valueOptions: AUTH_TYPE_OPTIONS,
      cellClassName: "basis-1/6",
      flex: 1,
    },
    {
      field: "path",
      headerName: "Path",
      // type: "date",
      width: 180,
      editable: true,
      cellClassName: "basis-1/6",
      flex: 1,
    },
    {
      field: "method",
      headerName: "Method",
      // width: 220,
      editable: true,
      type: "singleSelect",
      valueOptions: AUTH_METHOD_OPTIONS,
      cellClassName: "basis-1/6",
      flex: 1,
    },
    {
      field: "status",
      headerName: "状态",
      // width: 220,
      editable: true,
      type: "singleSelect",
      valueOptions: AUTH_STATUS_OPTIONS,
      cellClassName: "basis-1/6",
      flex: 1,
    },
    {
      field: "create_date",
      headerName: "Create Date",
      // width: 220,
      editable: false,
      type: "dateTime",
      cellClassName: "basis-1/6",
      flex: 1,
    },
    {
      field: "update_date",
      headerName: "Update Date",
      // width: 220,
      editable: false,
      type: "dateTime",
      cellClassName: "basis-1/6",
      flex: 1,
    },
  ];

  return (
    <Box sx={{ flexGrow: 1 }} mt={2}>
      <EditableTable
        initialEmptyDate={initialEmptyAuth}
        columns={columns}
        loading={loading}
        submitting={submitting}
        query={() => {}}
      />
    </Box>
  );
}
