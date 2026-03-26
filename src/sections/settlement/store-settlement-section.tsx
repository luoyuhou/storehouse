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
} from "@mui/material";
import { get, post } from "src/lib/http";
import {
  StoreSettlement,
  StoreSettlementWithDetails,
  E_SETTLEMENT_STATUS,
  SETTLEMENT_STATUS_LABELS,
} from "./types";

const statusColors = {
  [E_SETTLEMENT_STATUS.pending]: "warning",
  [E_SETTLEMENT_STATUS.confirmed]: "info",
  [E_SETTLEMENT_STATUS.settled]: "success",
} as const;

export function StoreSettlementSection() {
  const [settlements, setSettlements] = useState<StoreSettlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  // 详情弹窗
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState<StoreSettlementWithDetails | null>(
    null,
  );
  const [detailLoading, setDetailLoading] = useState(false);

  const loadSettlements = async () => {
    setLoading(true);
    try {
      const res = await get<{ list: StoreSettlement[]; total: number }>(
        "/api/store/settlement/store/list",
        { params: { page, pageSize } },
      );
      setSettlements(res.list || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error("加载结算列表失败:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettlements();
  }, [page]);

  const handleViewDetail = async (settlementId: string) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await get<StoreSettlementWithDetails>(
        `/api/store/settlement/store/${settlementId}`,
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
      await post({ url: `/api/store/settlement/store/${settlementId}/confirm`, payload: {} });
      loadSettlements();
    } catch (err) {
      console.error("确认结算失败:", err);
    }
  };

  const handleSettle = async (settlementId: string) => {
    try {
      await post({ url: `/api/store/settlement/store/${settlementId}/settle`, payload: {} });
      loadSettlements();
    } catch (err) {
      console.error("完成结算失败:", err);
    }
  };

  const formatMoney = (amount: number) => `¥${(amount / 100).toFixed(2)}`;

  return (
    <Box>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            商家月度结算
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            用户直接支付给商家，平台不介入。此处展示商家各月的收入结算记录。
          </Typography>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>月份</TableCell>
                  <TableCell>店铺</TableCell>
                  <TableCell align="right">订单数</TableCell>
                  <TableCell align="right">订单金额</TableCell>
                  <TableCell align="right">商家收入</TableCell>
                  <TableCell>状态</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* eslint-disable-next-line no-nested-ternary */}
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <TableRow key={i}>
                      {/* eslint-disable-next-line @typescript-eslint/no-shadow */}
                      {Array.from({ length: 7 }).map((_, j) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <TableCell key={j}>
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
                      <TableCell>{s.store_id.slice(0, 8)}...</TableCell>
                      <TableCell align="right">{s.total_orders}</TableCell>
                      <TableCell align="right">{formatMoney(s.total_amount)}</TableCell>
                      <TableCell align="right">{formatMoney(s.total_income)}</TableCell>
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
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>结算详情</DialogTitle>
        <DialogContent>
          {/* eslint-disable-next-line no-nested-ternary */}
          {detailLoading ? (
            <Skeleton variant="rectangular" height={200} />
          ) : selectedSettlement ? (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                基本信息
              </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>月份</TableCell>
                      <TableCell>{selectedSettlement.month}</TableCell>
                      <TableCell>店铺</TableCell>
                      <TableCell>
                        {selectedSettlement.store?.store_name || selectedSettlement.store_id}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>订单数</TableCell>
                      <TableCell>{selectedSettlement.total_orders}</TableCell>
                      <TableCell>商家收入</TableCell>
                      <TableCell>{formatMoney(selectedSettlement.total_income)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="subtitle2" gutterBottom>
                订单明细
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>订单ID</TableCell>
                      <TableCell align="right">金额</TableCell>
                      <TableCell>支付状态</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedSettlement.store_settlement_detail?.slice(0, 20).map((d) => (
                      <TableRow key={d.id}>
                        <TableCell>{d.order_id}</TableCell>
                        <TableCell align="right">{formatMoney(d.amount)}</TableCell>
                        <TableCell>{d.pay_status === 1 ? "已支付" : "未支付"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
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
