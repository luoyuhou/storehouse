import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import { GridColDef } from "@mui/x-data-grid";
import { EditableTable } from "src/components/table/editable.table";
import {
  AUTH_METHOD_OPTIONS,
  AUTH_PID_OPTIONS,
  AUTH_STATUS_OPTIONS,
  AUTH_TYPE_OPTIONS,
} from "src/constant/role-management.const";
import { AuthType } from "src/types/role-management.type";
import { patch, post } from "src/lib/http";
import { toast } from "react-toastify";
import { PaginationResponseType } from "src/types/common";

const initialEmptyAuth: AuthType = {
  id: 0,
  pid: "0",
  auth_id: "",
  side: 0,
  path: "",
  method: "",
  status: 1,
  create_date: new Date(),
  update_date: new Date(),
};

export function AuthForRoleManagement() {
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [pagination, setPagination] = useState<PaginationResponseType>({
    pages: 0,
    rows: 0,
    data: [],
  });

  const onSubmit = async (payload: AuthType) => {
    setSubmitting(true);
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { auth_id } = payload;
    const pickPayload = {
      method: payload.method,
      path: payload.path,
      pid: payload.pid,
      side: +payload.side,
      status: +payload.status,
    };
    if (auth_id) {
      // update
      return patch({ url: `/api/auth/role-management/auth/${auth_id}`, payload: pickPayload })
        .then(() => {
          return true;
        })
        .catch((err) => {
          toast.error(`[Update Resource]: ${err.message}`);
          return false;
        })
        .finally(() => setSubmitting(false));
    }

    // create
    return post({ url: "/api/auth/role-management/auth", payload: pickPayload })
      .then(() => {
        return true;
      })
      .catch((err) => {
        toast.error(`[Create Resource]: ${err.message}`);
        return false;
      })
      .finally(() => setSubmitting(false));
  };

  useEffect(() => {
    setLoading(true);
    post<{ data: PaginationResponseType }>({
      url: "/api/auth/role-management/auth/pagination",
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
    <Box sx={{ flexGrow: 1 }}>
      <EditableTable
        initialEmptyData={initialEmptyAuth}
        pagination={pagination}
        columns={columns}
        loading={loading}
        submitting={submitting}
        onChange={(payload) => onSubmit(payload as unknown as AuthType)}
        onDelete={() => {}}
      />
    </Box>
  );
}
