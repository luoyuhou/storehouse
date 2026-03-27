import React, { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import TrashIcon from "@heroicons/react/24/solid/TrashIcon";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Pagination,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import { toast } from "react-toastify";
import { deleteRequest, get } from "src/lib/http";
import { Layout as DashboardLayout } from "../../layouts/dashboard/layout";

interface FileItem {
  id: number;
  file_name: string;
  hash: string;
  size: number;
  url: string;
  create_date: string;
  update_date: string;
  ref_count: number;
}

interface FileListResponse {
  list: FileItem[];
  total: number;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Page() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const pageSize = 10;

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await get<FileListResponse>(`/api/file?page=${page}&pageSize=${pageSize}`);
      setFiles(res.list || []);
      setTotal(res.total || 0);
    } catch (error) {
      toast.error((error as { message: string })?.message || "加载文件列表失败");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleOpenDeleteDialog = (file: FileItem) => {
    setFileToDelete(file);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setFileToDelete(null);
  };

  const handleDelete = async () => {
    if (!fileToDelete) return;

    setDeleting(true);
    try {
      await deleteRequest<never>({ url: `/api/file/${fileToDelete.hash}` });
      toast.success("删除成功");
      handleCloseDeleteDialog();
      fetchFiles();
    } catch (error) {
      toast.error((error as { message: string })?.message || "删除失败");
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <>
      <Head>
        <title>文件资源管理</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 3,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Stack spacing={1}>
                <Typography variant="h4">文件资源管理</Typography>
                <Typography variant="body2" color="text.secondary">
                  管理系统中上传的图片资源，查看引用次数，删除未使用的文件
                </Typography>
              </Stack>
            </Stack>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>预览</TableCell>
                    <TableCell>文件名称</TableCell>
                    <TableCell>大小</TableCell>
                    <TableCell>创建时间</TableCell>
                    <TableCell>引用次数</TableCell>
                    <TableCell align="right">操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* eslint-disable-next-line no-nested-ternary */}
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        加载中...
                      </TableCell>
                    </TableRow>
                  ) : files.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        暂无文件
                      </TableCell>
                    </TableRow>
                  ) : (
                    files.map((file) => (
                      <TableRow key={file.id} hover>
                        <TableCell>
                          <Box
                            component="img"
                            src={`http://${file.url}`}
                            alt={file.file_name || file.hash}
                            sx={{
                              width: 60,
                              height: 60,
                              objectFit: "cover",
                              borderRadius: 1,
                              border: (theme) => `1px solid ${theme.palette.divider}`,
                              cursor: "pointer",
                              "&:hover": {
                                opacity: 0.8,
                              },
                            }}
                            onClick={() => window.open(`http://${file.url}`, "_blank")}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: 200,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={file.file_name || file.hash}
                          >
                            {file.file_name || file.hash}
                          </Typography>
                        </TableCell>
                        <TableCell>{formatFileSize(file.size)}</TableCell>
                        <TableCell>{formatDate(file.create_date)}</TableCell>
                        <TableCell>
                          <Chip
                            label={file.ref_count}
                            size="small"
                            color={file.ref_count > 0 ? "primary" : "default"}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip
                            title={file.ref_count > 0 ? "文件正在被使用，无法删除" : "删除文件"}
                          >
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                disabled={file.ref_count > 0}
                                onClick={() => handleOpenDeleteDialog(file)}
                              >
                                <SvgIcon fontSize="small">
                                  <TrashIcon />
                                </SvgIcon>
                              </IconButton>
                            </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, p) => setPage(p)}
                  color="primary"
                />
              </Box>
            )}
          </Stack>
        </Container>
      </Box>

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            确定要删除文件 "{fileToDelete?.file_name || fileToDelete?.hash}" 吗？
            此操作将从存储系统中永久删除该文件，无法恢复。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={deleting}>
            取消
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={deleting}>
            {deleting ? "删除中..." : "确认删除"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

Page.getLayout = (page: JSX.Element) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
