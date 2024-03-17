import { Box } from "@mui/material";
import React, { useState } from "react";
import { GridColDef } from "@mui/x-data-grid";
import { EditableTable } from "src/components/table/editable.table";
import { AUTH_PID_OPTIONS, AUTH_TYPE_OPTIONS } from "src/constant/role-management.const";

export function AuthRoleForRoleManagement() {
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const columns: GridColDef[] = [
    {
      field: "auth_id",
      headerName: "Resource",
      // width: 180,
      editable: true,
      type: "singleSelect",
      valueOptions: AUTH_PID_OPTIONS,
      cellClassName: "basis-1/6",
      flex: 1,
    },
    {
      field: "role_id",
      headerName: "Role",
      // type: "number",
      // width: 80,
      editable: true,
      type: "singleSelect",
      valueOptions: AUTH_TYPE_OPTIONS,
      cellClassName: "basis-1/6",
      flex: 1,
    },
    {
      field: "status",
      headerName: "Status",
      // type: "date",
      width: 180,
      editable: true,
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
        initialEmptyDate={{}}
        columns={columns}
        loading={loading}
        submitting={submitting}
        query={() => {}}
      />
    </Box>
  );
}
