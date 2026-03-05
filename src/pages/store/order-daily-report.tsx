import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import React, { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import ArrowPathIcon from "@heroicons/react/24/solid/ArrowPathIcon";
import { post } from "src/lib/http";
import { toast } from "react-toastify";

interface DailyReportGoods {
  goods_id: string;
  goods_version_id?: string;
  goods_name: string;
  total_count: number;
  total_amount: number; // 分
  unit_name: string;
  pack_count: number;
  version_number: string;
}

interface DailyReportStore {
  store_id: string;
  store_name: string;
  total_orders: number;
  total_amount: number; // 分
  goods: DailyReportGoods[];
}

interface DailyReportResponse {
  date: string;
  totalStores: number;
  totalOrders: number;
  totalAmount: number; // 分
  stores: DailyReportStore[];
}

function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function OrderDailyReportPage() {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    d.setHours(0, 0, 0, 0);
    return formatDateInput(d);
  });
  const [dateError, setDateError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<DailyReportResponse | null>(null);
  const [goodsDialogOpen, setGoodsDialogOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<DailyReportStore | null>(null);

  const handleDateChange = (value: string) => {
    setSelectedDate(value);

    if (!value) {
      setDateError("报表日期不能为空");
      return;
    }

    if (Number.isNaN(Date.parse(value))) {
      setDateError("报表日期格式不正确");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const picked = new Date(value);
    picked.setHours(0, 0, 0, 0);

    if (picked.getTime() > today.getTime()) {
      setDateError("报表日期不能晚于今天");
      return;
    }

    setDateError(null);
  };

  const fetchReport = useCallback(() => {
    if (!selectedDate) {
      toast.error("请先选择报表日期");
      return;
    }

    if (Number.isNaN(Date.parse(selectedDate))) {
      toast.error("报表日期格式不正确");
      return;
    }

    if (dateError) {
      toast.error(dateError);
      return;
    }

    setLoading(true);
    post<DailyReportResponse>({
      url: "/api/store/order/daily-report",
      payload: { recordDate: selectedDate },
    })
      .then((res) => {
        setReport(res);
      })
      .catch((err: { message?: string }) => {
        toast.error(err?.message || "加载日报数据失败");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleOpenGoodsDialog = (store: DailyReportStore) => {
    setSelectedStore(store);
    setGoodsDialogOpen(true);
  };

  const handleCloseGoodsDialog = () => {
    setGoodsDialogOpen(false);
    setSelectedStore(null);
  };

  const summary = report || {
    date: selectedDate,
    totalStores: 0,
    totalOrders: 0,
    totalAmount: 0,
    stores: [],
  };

  return (
    <>
      <Head>
        <title>订单日报</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 2,
        }}
      >
        <Container sx={{ maxWidth: "1600px !important" }}>
          <Stack spacing={3}>
            {/* 顶部标题和日期选择 */}
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Stack spacing={1}>
                <Typography variant="h4">订单日报</Typography>
                <Typography variant="body2" color="text.secondary">
                  按天查看每个商铺的订单量与商品消耗情况（默认展示前一天）。
                </Typography>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  label="报表日期"
                  type="date"
                  size="small"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  error={!!dateError}
                  helperText={dateError || "默认展示前一天的日报"}
                />

                <Button
                  variant="contained"
                  color="primary"
                  startIcon={
                    <SvgIcon fontSize="small">
                      <ArrowPathIcon />
                    </SvgIcon>
                  }
                  onClick={fetchReport}
                  disabled={loading}
                >
                  {loading ? "加载中..." : "刷新"}
                </Button>
              </Stack>
            </Stack>

            {/* 汇总卡片 */}
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom variant="overline">
                      报表日期
                    </Typography>
                    <Typography variant="h5">{summary.date || selectedDate}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom variant="overline">
                      参与店铺数
                    </Typography>
                    <Typography variant="h4">{summary.totalStores}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom variant="overline">
                      总订单数
                    </Typography>
                    <Typography variant="h4">{summary.totalOrders}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom variant="overline">
                      总金额
                    </Typography>
                    <Typography variant="h4">¥{(summary.totalAmount / 100).toFixed(2)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* 门店维度日报表 */}
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="overline">
                  门店订单与商品消耗
                </Typography>
                {summary.stores.length === 0 ? (
                  <Box sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      暂无该日期的日报数据。
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ mt: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>商铺名称</TableCell>
                          <TableCell>商铺ID</TableCell>
                          <TableCell align="right">订单数</TableCell>
                          <TableCell align="right">总金额（元）</TableCell>
                          <TableCell align="right">商品种类数</TableCell>
                          <TableCell align="center">操作</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {summary.stores.map((store) => (
                          <TableRow key={store.store_id} hover>
                            <TableCell>{store.store_name}</TableCell>
                            <TableCell>
                              <Typography variant="caption" color="text.secondary">
                                {store.store_id}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">{store.total_orders}</TableCell>
                            <TableCell align="right">
                              ¥{(store.total_amount / 100).toFixed(2)}
                            </TableCell>
                            <TableCell align="right">{store.goods.length}</TableCell>
                            <TableCell align="center">
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleOpenGoodsDialog(store)}
                              >
                                查看商品消耗
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Container>

        {/* 商品明细对话框 */}
        <Dialog open={goodsDialogOpen} onClose={handleCloseGoodsDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedStore ? `商品消耗明细 - ${selectedStore.store_name}` : "商品消耗明细"}
          </DialogTitle>
          <DialogContent>
            {selectedStore && selectedStore.goods.length > 0 ? (
              <Box sx={{ mt: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>商品名称</TableCell>
                      <TableCell>商品ID</TableCell>
                      <TableCell>版本/规格</TableCell>
                      <TableCell align="right">数量</TableCell>
                      <TableCell align="right">金额（元）</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {selectedStore.goods.map((g) => (
                      <TableRow key={g.goods_version_id || g.goods_id} hover>
                        <TableCell>{g.goods_name}</TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {g.goods_id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {g.unit_name || "-"}
                            {g.pack_count ? ` x${g.pack_count}` : ""}
                          </Typography>
                          {g.version_number && (
                            <Typography variant="caption" color="text.secondary">
                              {g.version_number}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">{g.total_count}</TableCell>
                        <TableCell align="right">¥{(g.total_amount / 100).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            ) : (
              <Box sx={{ py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  暂无商品消耗数据。
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                if (!selectedStore) return;
                const rows = selectedStore.goods.map((g, index) => ({
                  序号: index + 1,
                  日期: summary.date || selectedDate,
                  商铺名称: selectedStore.store_name,
                  商铺ID: selectedStore.store_id,
                  商品名称: g.goods_name,
                  商品ID: g.goods_id,
                  版本ID: g.goods_version_id || "",
                  单位: g.unit_name || "",
                  每份数量: g.pack_count ?? "",
                  版本号: g.version_number ?? "",
                  数量: g.total_count,
                  "金额/分": g.total_amount,
                  "金额/元": (g.total_amount / 100).toFixed(2),
                }));

                const ws = XLSX.utils.json_to_sheet(rows);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "商品消耗明细");
                const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
                const blob = new Blob([wbout], {
                  type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                });
                saveAs(
                  blob,
                  `商品消耗明细-${selectedStore.store_name}-${summary.date || selectedDate}.xlsx`,
                );
              }}
            >
              导出 Excel
            </Button>
            <Button onClick={handleCloseGoodsDialog}>关闭</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
}

OrderDailyReportPage.getLayout = (page: JSX.Element) => <DashboardLayout>{page}</DashboardLayout>;

export default OrderDailyReportPage;
