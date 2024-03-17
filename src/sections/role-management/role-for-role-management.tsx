import { Box } from "@mui/material";
import React, { useState } from "react";
import { GridColDef } from "@mui/x-data-grid";
import { EditableTable } from "src/components/table/editable.table";

export function RoleForRoleManagement() {
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const columns: GridColDef[] = [
    {
      field: "role_id",
      headerName: "Role ID",
      // width: 180,
      editable: false,
      type: "string",
      flex: 1,
    },
    {
      field: "role_name",
      headerName: "角色名称",
      // type: "number",
      // width: 80,
      editable: true,
      type: "string",
      cellClassName: "basis-1/6",
      flex: 1,
    },
    {
      field: "description",
      headerName: "描述",
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
