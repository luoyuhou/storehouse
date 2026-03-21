/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Head from "next/head";
import {
  Box,
  Button,
  Chip,
  Container,
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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination,
  FormControlLabel,
  Switch,
} from "@mui/material";
import PlusIcon from "@heroicons/react/24/solid/PlusIcon";
import { toast } from "react-toastify";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { post, patch } from "src/lib/http";
import { useAuth } from "src/hooks/use-auth";
import { authPermission } from "src/utils/auth";
import { FEEDBACK_CATEGORY_OPTIONS } from "src/constant/feedback.const";
import { FeedbackCreate } from "src/sections/feedback/feedback-create";
import { FeedbackComment } from "src/sections/feedback/feedback-comment";
import { FeedbackItem, FeedbackUserInfo } from "src/types/feedback.type";

interface FeedbackPaginationResponse {
  data: FeedbackItem[];
  rows: number;
  pages: number;
}

const STATUS_OPTIONS: {
  value: number;
  label: string;
  color: "default" | "warning" | "success" | "info" | "error";
}[] = [
  { value: 0, label: "待处理", color: "warning" },
  { value: 1, label: "处理中", color: "info" },
  { value: 2, label: "已完成", color: "success" },
  { value: 3, label: "不采纳", color: "error" },
  { value: -1, label: "已取消", color: "default" },
];

function formatDateTime(value?: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d} ${hh}:${mm}`;
}

function getUserDisplayName(user?: FeedbackUserInfo | null, fallbackUserId?: string): string {
  if (user) {
    const name = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
    if (name) return name;
    if (user.phone) return user.phone;
    return user.user_id;
  }
  return fallbackUserId || "";
}

function CommentOrFeaturePage() {
  const { user, authPaths } = useAuth() as unknown as {
    user: { id: string };
    authPaths: never[];
  };
  const canSetAdvancedStatus = authPermission(authPaths, "/manage/role-management");

  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(0);
  const [pages, setPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState<number | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all");
  const [onlyMine, setOnlyMine] = useState<boolean>(false);

  const [dialogOpen, setDialogOpen] = useState(false);

  const [commentDialogOpen, setCommentDialogOpen] = useState(false);

  const [commentTarget, setCommentTarget] = useState<FeedbackItem | null>(null);

  const currentStatusLabel = useCallback((status: number) => {
    const found = STATUS_OPTIONS.find((s) => s.value === status);
    return found ? found.label : `状态${status}`;
  }, []);

  const fetchList = useCallback(
    async (
      nextPageNum = 0,
      currentStatus: typeof statusFilter = statusFilter,
      currentCategory: typeof categoryFilter = categoryFilter,
      currentOnlyMine: boolean = onlyMine,
    ) => {
      setLoading(true);
      try {
        const filtered: { id: string; value: number | string }[] = [];
        if (currentStatus !== "all") {
          filtered.push({ id: "status", value: currentStatus });
        }
        if (currentCategory !== "all") {
          filtered.push({ id: "category", value: currentCategory });
        }
        if (currentOnlyMine && user?.id) {
          filtered.push({ id: "user_id", value: user.id });
        }
        const res = await post<FeedbackPaginationResponse>({
          url: "/api/feedback/pagination",
          payload: {
            pageNum: nextPageNum,
            pageSize: 5,
            sorted: [],
            filtered,
          },
        });
        setItems(res.data || []);
        setPages(res.pages || 0);
        setPageNum(nextPageNum);
      } catch (error) {
        toast.error((error as { message?: string })?.message || "加载列表失败");
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, categoryFilter, onlyMine, user],
  );

  useEffect(() => {
    fetchList(0, statusFilter);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusChange = async (item: FeedbackItem, status: number) => {
    if (item.status === status) return;
    try {
      await patch<{ message: string }>({
        url: `/api/feedback/${item.feedback_id}/status`,
        payload: { status },
      });
      toast.success("状态已更新");
      setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, status } : it)));
    } catch (error) {
      toast.error((error as { message?: string })?.message || "更新状态失败");
    }
  };

  const filteredStatusLabel = useMemo(() => {
    if (statusFilter === "all") return "全部";
    return currentStatusLabel(statusFilter);
  }, [statusFilter, currentStatusLabel]);

  const handleStatusFilterChange = (value: number | "all") => {
    setStatusFilter(value);
    fetchList(0, value, categoryFilter, onlyMine);
  };

  const handleCategoryFilterChange = (value: string | "all") => {
    setCategoryFilter(value);
    fetchList(0, statusFilter, value, onlyMine);
  };

  const handleOnlyMineChange = (checked: boolean) => {
    setOnlyMine(checked);
    fetchList(0, statusFilter, categoryFilter, checked);
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    const nextPageNum = page - 1;
    fetchList(nextPageNum, statusFilter, categoryFilter, onlyMine);
  };

  return (
    <>
      <Head>
        <title>用户建议与反馈</title>
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
                <Typography variant="h4">用户建议 / 功能需求</Typography>
                <Typography variant="body2" color="text.secondary">
                  收集并跟踪用户的意见、建议和改进需求，支持图片和视频链接。
                </Typography>
              </Stack>
              <div>
                <Button
                  onClick={() => setDialogOpen(true)}
                  startIcon={
                    <SvgIcon fontSize="small">
                      <PlusIcon />
                    </SvgIcon>
                  }
                  variant="contained"
                >
                  创建
                </Button>
              </div>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="subtitle2">当前筛选：</Typography>
              <Chip
                label={filteredStatusLabel}
                variant="outlined"
                color={statusFilter === "all" ? "default" : "primary"}
              />
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant={statusFilter === "all" ? "contained" : "outlined"}
                  onClick={() => handleStatusFilterChange("all")}
                >
                  全部
                </Button>
                {STATUS_OPTIONS.map((s) => (
                  <Button
                    key={s.value}
                    size="small"
                    variant={statusFilter === s.value ? "contained" : "outlined"}
                    onClick={() => handleStatusFilterChange(s.value)}
                  >
                    {s.label}
                  </Button>
                ))}
              </Stack>

              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel id="feedback-category-filter-label">分类</InputLabel>
                <Select
                  labelId="feedback-category-filter-label"
                  label="分类"
                  value={categoryFilter}
                  onChange={(e) => handleCategoryFilterChange(e.target.value as string | "all")}
                >
                  <MenuItem value="all">全部分类</MenuItem>
                  {FEEDBACK_CATEGORY_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={onlyMine}
                    onChange={(e) => handleOnlyMineChange(e.target.checked)}
                  />
                }
                label="只看我的"
              />
            </Stack>

            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>标题 / 分类</TableCell>
                    <TableCell>内容</TableCell>
                    <TableCell>附件</TableCell>
                    <TableCell>状态</TableCell>
                    <TableCell>创建时间</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* eslint-disable-next-line no-nested-ternary */}
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        加载中...
                      </TableCell>
                    </TableRow>
                  ) : items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        暂无数据
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => {
                      const attachments = item.attachments || [];
                      const imageAttachments = attachments.filter((att) => att.type === 1);
                      const videoAttachments = attachments.filter((att) => att.type === 2);

                      return (
                        <TableRow key={item.id} hover>
                          <TableCell width="22%">
                            <Stack spacing={0.5}>
                              <Typography variant="subtitle2">{item.title}</Typography>
                              <Stack direction="row" spacing={1} alignItems="center">
                                {item.category ? (
                                  <Chip
                                    size="small"
                                    label={
                                      FEEDBACK_CATEGORY_OPTIONS.find(
                                        (c) => c.value === item.category,
                                      )?.label || item.category
                                    }
                                    variant="outlined"
                                  />
                                ) : null}
                                <Typography variant="caption" color="text.secondary">
                                  用户：
                                  {getUserDisplayName(item.user, item.user_id)}
                                </Typography>
                              </Stack>
                            </Stack>
                          </TableCell>
                          <TableCell width="38%">
                            <Typography
                              variant="body2"
                              sx={{
                                display: "-webkit-box",
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {item.content}
                            </Typography>
                          </TableCell>
                          <TableCell width="20%">
                            <Stack spacing={1}>
                              {imageAttachments.length > 0 && (
                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                  {imageAttachments.map((att) => (
                                    <Box
                                      key={att.id}
                                      component="img"
                                      src={att.url}
                                      alt={att.description || "image"}
                                      sx={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: 1,
                                        objectFit: "cover",
                                      }}
                                    />
                                  ))}
                                </Stack>
                              )}
                              {videoAttachments.length > 0 && (
                                <Stack spacing={0.5}>
                                  {videoAttachments.map((att) => (
                                    <a
                                      key={att.id}
                                      href={att.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      style={{ fontSize: 12 }}
                                    >
                                      视频链接
                                    </a>
                                  ))}
                                </Stack>
                              )}
                              {attachments.length === 0 && (
                                <Typography variant="caption" color="text.secondary">
                                  无
                                </Typography>
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell width="10%">
                            <FormControl size="small" fullWidth>
                              <Select
                                value={item.status}
                                disabled={
                                  item.status === 2 || item.status === 3 || item.status === -1
                                }
                                onChange={(e) =>
                                  handleStatusChange(item, Number(e.target.value) || 0)
                                }
                              >
                                {STATUS_OPTIONS.map((s) => {
                                  const isOwner = user?.id && item.user_id === user.id;
                                  const isCancelable = isOwner && item.status === 0;
                                  const isFinal =
                                    item.status === 2 || item.status === 3 || item.status === -1;

                                  let disabled = false;

                                  if (isFinal) {
                                    // 已完成/不采纳：整体 Select 已禁用，这里保持选项只读
                                    disabled = s.value !== item.status;
                                  } else if (!canSetAdvancedStatus) {
                                    if (s.value === 4) {
                                      disabled = !isCancelable && s.value !== item.status;
                                    } else {
                                      disabled = s.value !== item.status;
                                    }
                                  } else if (s.value === 4) {
                                    disabled = !isCancelable && s.value !== item.status;
                                  } else {
                                    disabled = false;
                                  }

                                  return (
                                    <MenuItem key={s.value} value={s.value} disabled={disabled}>
                                      {s.label}
                                    </MenuItem>
                                  );
                                })}
                              </Select>
                            </FormControl>
                          </TableCell>
                          <TableCell width="10%">
                            <Stack spacing={0.5}>
                              <Typography variant="body2">
                                {formatDateTime(item.create_date)}
                              </Typography>
                              <Button
                                size="small"
                                variant="text"
                                onClick={() => {
                                  setCommentTarget(item);
                                  setCommentDialogOpen(true);
                                }}
                              >
                                查看 / 评论
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {pages > 1 && (
              <Box display="flex" justifyContent="center">
                <Pagination
                  count={pages}
                  page={pageNum + 1}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </Stack>
        </Container>

        <FeedbackCreate
          dialogOpen={dialogOpen}
          handleCloseDialog={setDialogOpen}
          reload={() => fetchList(0, statusFilter)}
        />

        <FeedbackComment
          commentTarget={commentTarget}
          commentDialogOpen={commentDialogOpen}
          setCommentDialogOpen={setCommentDialogOpen}
        />
      </Box>
    </>
  );
}

(CommentOrFeaturePage as any).getLayout = (page: JSX.Element) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default CommentOrFeaturePage;
