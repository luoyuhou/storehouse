import React from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import { Scrollbar } from "src/components/scrollbar";
import { OnlineUserType } from "src/types/users";
import { format } from "date-fns";
import { TablePaginationActions } from "src/components/table";

interface OnlineUsersTableProps {
  count?: number;
  items?: OnlineUserType[];
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => void;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  loading?: boolean;
  currentUserId?: string;
  onKickOffline?: (userId: string) => void;
}

// eslint-disable-next-line react/function-component-definition
export const OnlineUsersTable: React.FC<OnlineUsersTableProps> = (props) => {
  const {
    count = 0,
    items = [],
    page = 0,
    rowsPerPage = 10,
    onPageChange = () => {},
    onRowsPerPageChange,
    loading = false,
    currentUserId,
    onKickOffline = () => {},
  } = props;

  return (
    <Card>
      <Scrollbar>
        <Box sx={{ minWidth: 800 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>用户</TableCell>
                <TableCell>电话</TableCell>
                <TableCell>邮箱</TableCell>
                <TableCell>IP地址</TableCell>
                <TableCell>登录时间</TableCell>
                <TableCell>最后活动</TableCell>
                <TableCell align="center">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary">
                      暂无在线用户
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((user) => {
                  const isCurrentUser = user.user_id === currentUserId;

                  return (
                    <TableRow hover key={user.id}>
                      <TableCell>
                        <Stack alignItems="center" direction="row" spacing={2}>
                          <Avatar src={user.avatar || undefined}>
                            {user.first_name?.[0] || user.last_name?.[0]}
                          </Avatar>
                          <Typography variant="subtitle2">
                            {user.first_name} {user.last_name}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>{user.email || "-"}</TableCell>
                      <TableCell>{user.ip}</TableCell>
                      <TableCell>
                        {user.login_time
                          ? format(new Date(user.login_time), "yyyy-MM-dd HH:mm:ss")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {user.last_activity
                          ? format(new Date(user.last_activity), "yyyy-MM-dd HH:mm:ss")
                          : "-"}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          disabled={isCurrentUser}
                          onClick={() => onKickOffline(user.user_id)}
                        >
                          {isCurrentUser ? "当前用户" : "下线"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Box>
      </Scrollbar>
      <TablePagination
        component="div"
        count={count}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={onPageChange}
        rowsPerPageOptions={[5, 10, 25]}
        onRowsPerPageChange={onRowsPerPageChange}
        ActionsComponent={TablePaginationActions}
        labelRowsPerPage="每页行数:"
        labelDisplayedRows={({ from, to, count: innerCount }) => `${from}-${to} 共 ${innerCount}`}
      />
    </Card>
  );
};
