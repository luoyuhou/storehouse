/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import NextLink from "next/link";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Link,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { get, patch, post } from "src/lib/http";

const ORDER_STATUS_MAP: Record<
  number,
  { label: string; color: "warning" | "success" | "default" }
> = {
  0: { label: "待处理", color: "warning" },
  1: { label: "已确认", color: "success" },
  2: { label: "已取消", color: "default" },
};

const CODE_STATUS_MAP: Record<number, { label: string; color: "success" | "default" }> = {
  0: { label: "未使用", color: "success" },
  1: { label: "已使用", color: "default" },
};

const TYPE_MAP: Record<string, string> = {
  STORE_CREATE: "新门店验证码",
  MEMBER_QUOTA: "会员扩容",
};

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-CN");
}

function QuotaOrdersPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(0);
  const [pages, setPages] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  const fetchPendingCount = useCallback(async () => {
    try {
      const res = await get<{ count: number }>("/api/platform/quota-orders/pending-count");
      setPendingCount(res.count || 0);
    } catch {
      // ignore
    }
  }, []);

  const fetchList = useCallback(async (nextPage = 0) => {
    setLoading(true);
    try {
      const res = await post<{ data: any[]; pages: number }>({
        url: "/api/platform/quota-orders/pagination",
        payload: { pageNum: nextPage, pageSize: 10, sorted: [], filtered: [] },
      });
      setItems(res.data || []);
      setPages(res.pages || 0);
      setPageNum(nextPage);
    } catch (err) {
      toast.error((err as { message?: string })?.message || "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList(0);
    fetchPendingCount();
  }, [fetchList, fetchPendingCount]);

  const handleConfirm = async (orderId: string) => {
    try {
      await patch({
        url: `/api/platform/quota-orders/${orderId}/confirm`,
        payload: {},
      });
      toast.success("已确认并发码");
      fetchList(pageNum);
      fetchPendingCount();
    } catch (err) {
      toast.error((err as { message?: string })?.message || "操作失败");
    }
  };

  const handleCancel = async (orderId: string) => {
    try {
      await patch({
        url: `/api/platform/quota-orders/${orderId}/cancel`,
        payload: {},
      });
      toast.success("已取消");
      fetchList(pageNum);
      fetchPendingCount();
    } catch (err) {
      toast.error((err as { message?: string })?.message || "操作失败");
    }
  };

  return (
    <>
      <Head>
        <title>配额订单</title>
      </Head>
      <Box component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack spacing={1}>
              <Typography variant="h4">配额订单</Typography>
              <Typography variant="body2" color="text.secondary">
                确认订单后自动发码。验证码一码一用、绑定手机号，可在此查看发码与使用状态。
              </Typography>
            </Stack>
            {pendingCount > 0 && (
              <Alert severity="warning">
                有新订单待处理（{pendingCount} 条），请注意确认并发码。
              </Alert>
            )}
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>订单号</TableCell>
                    <TableCell>类型</TableCell>
                    <TableCell>手机号</TableCell>
                    <TableCell>人数</TableCell>
                    <TableCell>金额</TableCell>
                    <TableCell>订单状态</TableCell>
                    <TableCell>验证码</TableCell>
                    <TableCell>使用状态</TableCell>
                    <TableCell>使用时间</TableCell>
                    <TableCell>使用门店</TableCell>
                    <TableCell>下单时间</TableCell>
                    <TableCell>操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => {
                    const orderSt = ORDER_STATUS_MAP[item.status] || ORDER_STATUS_MAP[0];
                    const code = item.activationCode;
                    const codeSt =
                      code != null ? CODE_STATUS_MAP[code.status] || CODE_STATUS_MAP[0] : null;
                    return (
                      <TableRow key={item.order_id}>
                        <TableCell>{item.order_id}</TableCell>
                        <TableCell>{TYPE_MAP[item.order_type] || item.order_type}</TableCell>
                        <TableCell>{item.phone}</TableCell>
                        <TableCell>{item.quota_amount || "-"}</TableCell>
                        <TableCell>
                          {item.amount > 0 ? `￥${(item.amount / 100).toFixed(2)}` : "-"}
                        </TableCell>
                        <TableCell>
                          <Chip label={orderSt.label} color={orderSt.color} size="small" />
                        </TableCell>
                        <TableCell>
                          {code?.code ? (
                            <Typography fontWeight="bold" color="success.main">
                              {code.code}
                            </Typography>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          {codeSt ? (
                            <Chip label={codeSt.label} color={codeSt.color} size="small" />
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>{formatDateTime(code?.used_date)}</TableCell>
                        <TableCell>
                          {code?.used_store_id ? (
                            <Link
                              component={NextLink}
                              href={`/manage/companies/${code.used_store_id}`}
                              underline="hover"
                              target="_blank"
                            >
                              {code.used_store_name || code.used_store_id}
                            </Link>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>{formatDateTime(item.create_date)}</TableCell>
                        <TableCell>
                          {item.status === 0 && (
                            <Stack direction="row" spacing={1}>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => handleConfirm(item.order_id)}
                              >
                                发码
                              </Button>
                              <Button
                                size="small"
                                color="inherit"
                                onClick={() => handleCancel(item.order_id)}
                              >
                                取消
                              </Button>
                            </Stack>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {!loading && items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={12} align="center">
                        暂无订单
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {pages > 1 && (
              <Pagination count={pages} page={pageNum + 1} onChange={(_, p) => fetchList(p - 1)} />
            )}
          </Stack>
        </Container>
      </Box>
    </>
  );
}

QuotaOrdersPage.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

export default QuotaOrdersPage;
