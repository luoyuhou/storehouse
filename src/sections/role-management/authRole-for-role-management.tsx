import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import { GridColDef } from "@mui/x-data-grid";
import { EditableTable } from "src/components/table/editable.table";
import { AUTH_PID_OPTIONS, AUTH_TYPE_OPTIONS } from "src/constant/role-management.const";
import { PaginationResponseType } from "src/types/common";
import { AuthRoleType } from "src/types/role-management.type";
import { patch, post } from "src/lib/http";
import { toast } from "react-toastify";

export function AuthRoleForRoleManagement() {
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [pagination, setPagination] = useState<PaginationResponseType>({
    pages: 0,
    rows: 0,
    data: [],
  });

  const onSubmit = (payload: AuthRoleType) => {
    setSubmitting(true);
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { auth_id } = payload;
    const pickPayload = {
      role_id: payload.role_id,
      auth_id: payload.auth_id,
      status: payload.status,
    };
    if (auth_id) {
      // update
      patch({ url: `/api/auth/role-management/auth-role/${auth_id}`, payload: pickPayload })
        .then(() => {})
        .catch(() => {})
        .finally(() => setSubmitting(false));
      return;
    }

    // create
    post({ url: "/api/auth/role-management/auth-role", payload: pickPayload })
      .then(() => {})
      .catch(() => {})
      .finally(() => setSubmitting(false));
  };

  useEffect(() => {
    setLoading(true);
    post<{ data: PaginationResponseType }>({
      url: "/api/auth/role-management/auth-role/pagination",
      payload: { pageNum: 0, pageSize: 10, sorted: [], filtered: [] },
    })
      .then(({ data: { pages, data, rows } }) => {
        setPagination({
          pages,
          rows,
          data: data.map((v) => ({
            ...v,
            create_date: new Date(v.create_date),
            update_date: new Date(v.update_date),
          })),
        });
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

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
        pagination={pagination}
        initialEmptyData={{}}
        columns={columns}
        loading={loading}
        submitting={submitting}
        onChange={(payload) => onSubmit(payload as unknown as AuthRoleType)}
        onDelete={() => {}}
      />
    </Box>
  );
}
