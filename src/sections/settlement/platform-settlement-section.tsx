import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
  Paper,
  Pagination,
  Stack,
  Skeleton,
  Grid,
} from "@mui/material";
import { get, post } from "src/lib/http";
import {
  PlatformSettlement,
  PlatformSettlementWithDetails,
  E_SETTLEMENT_STATUS,
  SETTLEMENT_STATUS_LABELS,
} from "./types";

const statusColors = {
  [E_SETTLEMENT_STATUS.pending]: "warning",
  [E_SETTLEMENT_STATUS.confirmed]: "info",
  [E_SETTLEMENT_STATUS.settled]: "success",
} as const;

export function PlatformSettlementSection() {
  const [settlements, setSettlements] = useState<PlatformSettlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  // 详情弹窗
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedSettlement, setSelectedSettlement] =
    useState<PlatformSettlementWithDetails | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // 统计数据
  const [stats, setStats] = useState<{
    totalAmount: number;
    totalSubscriptionFee: number;
    totalResourceFee: number;
    totalOrderServiceFee: number;
  } | null>(null);

  const loadSettlements = async () => {
    setLoading(true);
    try {
      const res = await get<{ list: PlatformSettlement[]; total: number }>(
        "/api/store/settlement/platform/list",
        { params: { page, pageSize } },
      );
      setSettlements(res.list || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error("加载平台结算列表失败:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await get<{
        totalAmount: number;
        totalSubscriptionFee: number;
        totalResourceFee: number;
        totalOrderServiceFee: number;
      }>("/api/store/settlement/platform/stats");
      setStats(res);
    } catch (err) {
      console.error("加载统计失败:", err);
    }
  };

  useEffect(() => {
    loadSettlements();
    loadStats();
  }, [page]);

  const handleViewDetail = async (settlementId: string) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await get<PlatformSettlementWithDetails>(
        `/api/store/settlement/platform/${settlementId}`,
      );
      setSelectedSettlement(res);
    } catch (err) {
      console.error("加载结算详情失败:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleConfirm = async (settlementId: string) => {
    try {
      await post({ url: `/api/store/settlement/platform/${settlementId}/confirm`, payload: {} });
      loadSettlements();
    } catch (err) {
      console.error("确认结算失败:", err);
    }
  };

  const handleSettle = async (settlementId: string) => {
    try {
      await post({ url: `/api/store/settlement/platform/${settlementId}/settle`, payload: {} });
      loadSettlements();
      loadStats();
    } catch (err) {
      console.error("完成结算失败:", err);
    }
  };

  const formatMoney = (amount: number) => `¥${(amount / 100).toFixed(2)}`;

  return (
    <Box>
      {/* 统计卡片 */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                总收入
              </Typography>
              <Typography variant="h5">{stats ? formatMoney(stats.totalAmount) : "-"}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                订阅费用
              </Typography>
              <Typography variant="h5">
                {stats ? formatMoney(stats.totalSubscriptionFee) : "-"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                资源购买
              </Typography>
              <Typography variant="h5">
                {stats ? formatMoney(stats.totalResourceFee) : "-"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                订单服务费
              </Typography>
              <Typography variant="h5">
                {stats ? formatMoney(stats.totalOrderServiceFee) : "-"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            平台月度结算
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            平台收入来源：1. 商家订阅套餐费用；2. 商家购买图片资源；3.
            订单服务费（每天10单免费，超出部分每天0.1元）
          </Typography>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>月份</TableCell>
                  <TableCell align="right">订阅费用</TableCell>
                  <TableCell align="right">资源费用</TableCell>
                  <TableCell align="right">订单服务费</TableCell>
                  <TableCell align="right">总收入</TableCell>
                  <TableCell>状态</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* eslint-disable-next-line no-nested-ternary */}
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <TableRow key={`${i}-idx`}>
                      {/* eslint-disable-next-line @typescript-eslint/no-shadow */}
                      {Array.from({ length: 7 }).map((_, j) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <TableCell key={`${i}-${j}-idx`}>
                          <Skeleton variant="text" width={60} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : settlements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      暂无结算记录
                    </TableCell>
                  </TableRow>
                ) : (
                  settlements.map((s) => (
                    <TableRow key={s.settlement_id}>
                      <TableCell>{s.month}</TableCell>
                      <TableCell align="right">{formatMoney(s.total_subscription_fee)}</TableCell>
                      <TableCell align="right">{formatMoney(s.total_resource_fee)}</TableCell>
                      <TableCell align="right">{formatMoney(s.total_order_service_fee)}</TableCell>
                      <TableCell align="right">{formatMoney(s.total_amount)}</TableCell>
                      <TableCell>
                        <Chip
                          label={SETTLEMENT_STATUS_LABELS[s.status as E_SETTLEMENT_STATUS]}
                          color={statusColors[s.status as E_SETTLEMENT_STATUS]}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Button size="small" onClick={() => handleViewDetail(s.settlement_id)}>
                            详情
                          </Button>
                          {s.status === E_SETTLEMENT_STATUS.pending && (
                            <Button
                              size="small"
                              color="primary"
                              onClick={() => handleConfirm(s.settlement_id)}
                            >
                              确认
                            </Button>
                          )}
                          {s.status === E_SETTLEMENT_STATUS.confirmed && (
                            <Button
                              size="small"
                              color="success"
                              onClick={() => handleSettle(s.settlement_id)}
                            >
                              结算
                            </Button>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
            <Pagination
              count={Math.ceil(total / pageSize)}
              page={page}
              onChange={(_, p) => setPage(p)}
              color="primary"
            />
          </Box>
        </CardContent>
      </Card>

      {/* 详情弹窗 */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>平台结算详情</DialogTitle>
        <DialogContent>
          {/* eslint-disable-next-line no-nested-ternary */}
          {detailLoading ? (
            <Skeleton variant="rectangular" height={300} />
          ) : selectedSettlement ? (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                月度汇总
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} md={3}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: "center" }}>
                    <Typography color="textSecondary" variant="overline">
                      订阅费用
                    </Typography>
                    <Typography variant="h6">
                      {formatMoney(selectedSettlement.total_subscription_fee)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: "center" }}>
                    <Typography color="textSecondary" variant="overline">
                      资源费用
                    </Typography>
                    <Typography variant="h6">
                      {formatMoney(selectedSettlement.total_resource_fee)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: "center" }}>
                    <Typography color="textSecondary" variant="overline">
                      订单服务费
                    </Typography>
                    <Typography variant="h6">
                      {formatMoney(selectedSettlement.total_order_service_fee)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: "center" }}>
                    <Typography color="textSecondary" variant="overline">
                      总收入
                    </Typography>
                    <Typography variant="h6">
                      {formatMoney(selectedSettlement.total_amount)}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {selectedSettlement.summary && (
                <>
                  {/* 订阅费用明细 */}
                  <Typography variant="subtitle2" gutterBottom>
                    订阅费用明细 ({selectedSettlement.summary.subscription.length}条)
                  </Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>店铺ID</TableCell>
                          <TableCell align="right">金额</TableCell>
                          <TableCell>备注</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedSettlement.summary.subscription.slice(0, 10).map((d) => (
                          <TableRow key={d.id}>
                            <TableCell>{d.store_id.slice(0, 8)}...</TableCell>
                            <TableCell align="right">{formatMoney(d.amount)}</TableCell>
                            <TableCell>{d.remark}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* 资源购买明细 */}
                  <Typography variant="subtitle2" gutterBottom>
                    资源购买明细 ({selectedSettlement.summary.resource.length}条)
                  </Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>店铺ID</TableCell>
                          <TableCell>订单ID</TableCell>
                          <TableCell align="right">金额</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedSettlement.summary.resource.slice(0, 10).map((d) => (
                          <TableRow key={d.id}>
                            <TableCell>{d.store_id.slice(0, 8)}...</TableCell>
                            <TableCell>{d.ref_id}</TableCell>
                            <TableCell align="right">{formatMoney(d.amount)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* 订单服务费明细 */}
                  <Typography variant="subtitle2" gutterBottom>
                    订单服务费明细 ({selectedSettlement.summary.orderService.length}条) -
                    每天10单免费，超出每天0.1元
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>店铺ID</TableCell>
                          <TableCell>日期</TableCell>
                          <TableCell align="right">金额</TableCell>
                          <TableCell>备注</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedSettlement.summary.orderService.slice(0, 20).map((d) => (
                          <TableRow key={d.id}>
                            <TableCell>{d.store_id.slice(0, 8)}...</TableCell>
                            <TableCell>{d.ref_id.split("_").pop()}</TableCell>
                            <TableCell align="right">{formatMoney(d.amount)}</TableCell>
                            <TableCell>{d.remark}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
