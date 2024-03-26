import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import { GridColDef } from "@mui/x-data-grid";
import { EditableTable } from "src/components/table/editable.table";
import { PaginationResponseType } from "src/types/common";
import { UserRoleType } from "src/types/role-management.type";
import { patch, post } from "src/lib/http";
import { toast } from "react-toastify";
import { USER_ROLE_STATUS_OPTIONS } from "src/constant/role-management.const";

export function UserRoleForRoleManagement() {
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [pagination, setPagination] = useState<PaginationResponseType>({
    pages: 0,
    rows: 0,
    data: [],
  });

  const [roles, setRoles] = useState<{ label: string; value: string }[]>([]);
  const [users, setUsers] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    post<{ data: PaginationResponseType }>({
      url: "/api/auth/role-management/role/pagination",
      payload: {
        pageNum: 0,
        pageSize: 10,
        sorted: [],
        filtered: [{ id: "update_date", desc: true }],
      },
    }).then(({ data: { data } }) => {
      setRoles(data.map((v) => ({ label: v.role_name, value: v.role_id })));
    });
  }, []);

  useEffect(() => {
    post<{ data: PaginationResponseType }>({
      url: "/api/users/pagination",
      payload: { pageNum: 0, pageSize: 10, sorted: [], filtered: [] },
    }).then(({ data: { data } }) => {
      const values = data.map((v) => ({ label: v.phone, value: v.user_id }));
      setUsers(values);
    });
  }, []);

  const onSubmit = (payload: UserRoleType) => {
    setSubmitting(true);
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { id } = payload;
    const pickPayload = {
      role_id: payload.role_id,
      user_id: payload.user_id,
      status: payload.status,
    };
    if (id.toString().length < 10) {
      // update
      patch({ url: `/api/auth/role-management/user-role/${id}`, payload: pickPayload })
        .then(() => {})
        .catch(() => {})
        .finally(() => setSubmitting(false));
      return;
    }

    // create
    post({ url: "/api/auth/role-management/user-role", payload: pickPayload })
      .then(() => {})
      .catch(() => {})
      .finally(() => setSubmitting(false));
  };

  useEffect(() => {
    setLoading(true);
    post<{ data: PaginationResponseType }>({
      url: "/api/auth/role-management/user-role/pagination",
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
      field: "user_id",
      headerName: "User",
      // type: "number",
      // width: 80,
      editable: true,
      type: "singleSelect",
      valueOptions: users,
      cellClassName: "basis-1/6",
      flex: 1,
    },
    {
      field: "role_id",
      headerName: "Role ID",
      // width: 180,
      editable: true,
      type: "singleSelect",
      valueOptions: roles,
      cellClassName: "basis-1/6",
      flex: 1,
    },
    {
      field: "status",
      headerName: "状态",
      // type: "date",
      editable: true,
      type: "singleSelect",
      valueOptions: USER_ROLE_STATUS_OPTIONS,
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
        onChange={(payload) => onSubmit(payload as unknown as UserRoleType)}
        onDelete={() => {}}
      />
    </Box>
  );
}
