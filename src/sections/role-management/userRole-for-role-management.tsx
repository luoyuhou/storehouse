import { Box } from "@mui/material";
import React, { useState } from "react";
import { GridColDef } from "@mui/x-data-grid";
import { EditableTable } from "src/components/table/editable.table";

export function UserRoleForRoleManagement() {
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const columns: GridColDef[] = [
    {
      field: "role_id",
      headerName: "Role ID",
      // width: 180,
      editable: true,
      type: "singleSelect",
      valueOptions: [],
      cellClassName: "basis-1/6",
      flex: 1,
    },
    {
      field: "user_id",
      headerName: "User",
      // type: "number",
      // width: 80,
      editable: true,
      type: "string",
      cellClassName: "basis-1/6",
      flex: 1,
    },
    {
      field: "status",
      headerName: "状态",
      // type: "date",
      editable: true,
      type: "singleSelect",
      valueOptions: [],
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
