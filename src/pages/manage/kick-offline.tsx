import React, { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import { Box, Container, Stack, Typography } from "@mui/material";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { OnlineUsersTable } from "src/sections/online-users/online-users-table";
import { OnlineUserType } from "src/types/users";
import { post, deleteRequest } from "src/lib/http";
import { toast } from "react-toastify";
import { useAuth } from "src/hooks/use-auth";

function Page() {
  const { user } = useAuth() as unknown as { user?: { id: string } };
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rows, setRows] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUserType[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOnlineUsers = useCallback(() => {
    setLoading(true);
    post<{ data: { data: OnlineUserType[]; rows: number }; message: string }>({
      url: "/api/auth/role-management/online-users/pagination",
      payload: {
        pageNum: page,
        pageSize: rowsPerPage,
        sorted: [],
        filtered: [],
      },
    })
      .then((response) => {
        setOnlineUsers(response.data.data);
        setRows(response.data.rows);
      })
      .catch((error) => {
        toast.error(error.message || "获取在线用户列表失败");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchOnlineUsers();
  }, [fetchOnlineUsers]);

  const handlePageChange = useCallback(
    (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
      setPage(newPage);
    },
    [],
  );

  const handleRowsPerPageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleKickOffline = useCallback(
    (userId: string) => {
      if (!window.confirm("确定要让该用户下线吗？")) {
        return;
      }

      deleteRequest({
        url: `/api/auth/role-management/online-users/kick-offline/${userId}`,
      })
        .then(() => {
          toast.success("操作成功");
          fetchOnlineUsers();
        })
        .catch((error) => {
          toast.error(error.message || "操作失败");
        });
    },
    [fetchOnlineUsers],
  );

  return (
    <>
      <Head>
        <title>踢人下线 | Storehouse</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Stack spacing={1}>
                <Typography variant="h4">踢人下线</Typography>
                <Typography variant="body2" color="text.secondary">
                  管理当前在线用户，可强制让用户下线
                </Typography>
              </Stack>
            </Stack>
            <OnlineUsersTable
              count={rows}
              items={onlineUsers}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              loading={loading}
              currentUserId={user?.id}
              onKickOffline={handleKickOffline}
            />
          </Stack>
        </Container>
      </Box>
    </>
  );
}

Page.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
