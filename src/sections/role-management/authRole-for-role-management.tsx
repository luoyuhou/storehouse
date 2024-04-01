import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import { GridColDef } from "@mui/x-data-grid";
import { EditableTable } from "src/components/table/editable.table";
import {
  AUTH_PID_OPTIONS,
  AUTH_TYPE_OPTIONS,
  ROLE_AUTH_STATUS_OPTIONS,
} from "src/constant/role-management.const";
import { PaginationResponseType } from "src/types/common";
import { AuthRoleType, AuthType, RoleType } from "src/types/role-management.type";
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

  const [roles, setRoles] = useState<{ label: string; value: string }[]>([]);
  const [resources, setResources] = useState<{ label: string; value: string }[]>([]);

  const onSubmit = async (payload: AuthRoleType) => {
    setSubmitting(true);
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { id, auth_id } = payload;
    const pickPayload = {
      role_id: payload.role_id,
      auth_id: payload.auth_id,
      status: payload.status,
    };
    if (id.toString().length <= 10) {
      // update
      return patch({ url: `/api/auth/role-management/auth-role/${auth_id}`, payload: pickPayload })
        .then(() => {
          return true;
        })
        .catch((err) => {
          toast.error(err.message);
          return false;
        })
        .finally(() => setSubmitting(false));
    }

    // create
    return post({ url: "/api/auth/role-management/auth-role", payload: pickPayload })
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      })
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

  useEffect(() => {
    post<{ data: { pages: number; rows: number; data: RoleType[] }; message: string }>({
      url: "/api/auth/role-management/role/pagination",
      payload: {
        pageNum: 0,
        pageSize: 10,
        filtered: [],
        sorted: [],
      },
    })
      .then(({ data: { data } }) => {
        setRoles(data.map(({ role_id, role_name }) => ({ label: role_name, value: role_id })));
      })
      .catch((err) => toast.error(err.message));

    post<{ data: { pages: number; rows: number; data: AuthType[] }; message: string }>({
      url: "/api/auth/role-management/auth/pagination",
      payload: { pageNum: 0, pageSize: 10, filtered: [], sorted: [] },
    })
      .then(({ data: { data } }) => {
        setResources(
          data.map(({ auth_id, side, path, method }) => ({
            label: `[${AUTH_TYPE_OPTIONS.find((i) => i.value === side)?.label}]-[${path}:${method}]`,
            value: auth_id,
          })),
        );
      })
      .catch((err) => toast.error(err.message));
  }, []);

  const columns: GridColDef[] = [
    {
      field: "role_id",
      headerName: "Role",
      // type: "number",
      // width: 80,
      editable: true,
      type: "singleSelect",
      valueOptions: roles,
      cellClassName: "basis-1/6",
      flex: 1,
    },
    {
      field: "auth_id",
      headerName: "Resource",
      // width: 180,
      editable: true,
      type: "singleSelect",
      valueOptions: resources,
      cellClassName: "basis-1/6",
      flex: 1,
    },
    {
      field: "status",
      headerName: "Status",
      // type: "date",
      width: 180,
      editable: true,
      type: "singleSelect",
      valueOptions: ROLE_AUTH_STATUS_OPTIONS,
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
