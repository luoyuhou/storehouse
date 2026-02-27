import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import {
  Box,
  Button,
  Container,
  Stack,
  SvgIcon,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import CustomerTabs from "src/components/tabs/customer-tabs";
import StoreOrderAcceptTable from "src/sections/store/order/accept-pending.table";
import StoreOrderFinishedTable from "src/sections/store/order/order-finished.table";
import StoreOrderAllTable from "src/sections/store/order/order-all.table";
import { CustomerFilter } from "src/components/filter/customer-filter";
import ArrowUpOnSquareIcon from "@heroicons/react/24/solid/ArrowUpOnSquareIcon";
import ArrowDownOnSquareIcon from "@heroicons/react/24/solid/ArrowDownOnSquareIcon";
import { post } from "src/lib/http";
import StoreOrderDeliveryTable from "src/sections/store/order/delivery-pending.table";
import StoreOrderPendingTable from "src/sections/store/order/order-pending.table";
import StoreOrderPaymentPendingTable from "src/sections/store/order/payment-pending.table";
import { Chart } from "src/components/chart";
import { alpha, useTheme } from "@mui/material/styles";

type TrendPoint = { date: string; total: number; totalAmount: number };

type Metrics = {
  windowDays: number;
  totalOrders: number;
  totalAmount: number;
  avgOrderValue: number;
  cancelRate: number;
  repurchaseRate: number;
};

function Order() {
  const theme = useTheme();
  const [trigger, setTrigger] = useState(0);
  const [statistics, setStatistics] = useState<{
    pending: number;
    stocking: number;
    shipping: number;
    finished: number;
    total: number;
    totalAmount: number;
    today?: { total: number; totalAmount: number };
    byStore?: { storeId: string; storeName: string; total: number; totalAmount: number }[];
  }>({
    pending: 0,
    stocking: 0,
    shipping: 0,
    finished: 0,
    total: 0,
    totalAmount: 0,
    today: { total: 0, totalAmount: 0 },
    byStore: [],
  });

  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    // 加载订单统计数据
    post<never>({
      url: "/api/store/order/statistics",
      payload: {},
    })
      .then((res) => {
        setStatistics(res);
      })
      .catch((err) => {
        console.error("Failed to load statistics:", err);
      });

    // 加载订单趋势（最近 10 天）
    post<{ days: number; points: TrendPoint[] }>({
      url: "/api/store/order/trend",
      payload: { days: 10 },
    })
      .then((res) => {
        setTrend(res.points || []);
      })
      .catch((err) => {
        console.error("Failed to load trend:", err);
      });

    // 加载运营指标（最近 30 天）
    post<Metrics>({
      url: "/api/store/order/metrics",
      payload: { days: 30 },
    })
      .then((res) => {
        setMetrics(res);
      })
      .catch((err) => {
        console.error("Failed to load metrics:", err);
      });
  }, [trigger]);

  return (
    <>
      <Head>
        <title>订单管理</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 2,
        }}
      >
        <Container style={{ maxWidth: "1600px" }}>
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Stack spacing={1}>
                <Typography variant="h4">订单管理</Typography>
                <Stack alignItems="center" direction="row" spacing={1}>
                  <Button
                    color="inherit"
                    startIcon={
                      <SvgIcon fontSize="small">
                        <ArrowUpOnSquareIcon />
                      </SvgIcon>
                    }
                  >
                    导入
                  </Button>
                  <Button
                    color="inherit"
                    startIcon={
                      <SvgIcon fontSize="small">
                        <ArrowDownOnSquareIcon />
                      </SvgIcon>
                    }
                  >
                    导出
                  </Button>
                </Stack>
              </Stack>
            </Stack>

            {/* 订单统计卡片 */}
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={2}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom variant="overline">
                      待处理
                    </Typography>
                    <Typography variant="h4">{statistics.pending}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom variant="overline">
                      备货中
                    </Typography>
                    <Typography variant="h4">{statistics.stocking}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom variant="overline">
                      运输中
                    </Typography>
                    <Typography variant="h4">{statistics.shipping}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom variant="overline">
                      已完成
                    </Typography>
                    <Typography variant="h4">{statistics.finished}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom variant="overline">
                      总订单数
                    </Typography>
                    <Typography variant="h4">{statistics.total}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom variant="overline">
                      总金额
                    </Typography>
                    <Typography variant="h4">
                      ¥{(statistics.totalAmount / 100).toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* 今日概览 */}
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom variant="overline">
                      今日订单数
                    </Typography>
                    <Typography variant="h4">{statistics.today?.total ?? 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom variant="overline">
                      今日金额
                    </Typography>
                    <Typography variant="h4">
                      ¥{((statistics.today?.totalAmount ?? 0) / 100).toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* 按店铺维度的简单运营列表 */}
              {statistics.byStore && statistics.byStore.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom variant="overline">
                        店铺维度概览
                      </Typography>
                      {statistics.byStore.map((store) => (
                        <Box
                          key={store.storeId}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 1,
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            {store.storeName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {store.total} 单 · ¥{(store.totalAmount / 100).toFixed(2)}
                          </Typography>
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>

            {/* 订单趋势图 + 高级运营指标 */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom variant="overline">
                      最近 10 天订单趋势
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      {trend.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          暂无订单趋势数据
                        </Typography>
                      ) : (
                        <Chart
                          height={320}
                          type="bar"
                          width="100%"
                          options={{
                            chart: {
                              background: "transparent",
                              stacked: false,
                              toolbar: { show: false },
                            },
                            colors: [
                              theme.palette.primary.main,
                              alpha(theme.palette.primary.main, 0.25),
                            ],
                            dataLabels: { enabled: false },
                            grid: {
                              borderColor: theme.palette.divider,
                              strokeDashArray: 2,
                              yaxis: { lines: { show: true } },
                            },
                            xaxis: {
                              categories: trend.map((p) => p.date.slice(5)),
                              labels: {
                                style: { colors: theme.palette.text.secondary },
                              },
                            },
                            yaxis: {
                              labels: {
                                style: { colors: theme.palette.text.secondary },
                              },
                            },
                            legend: { show: true },
                          }}
                          series={[
                            {
                              name: "订单数",
                              data: trend.map((p) => p.total),
                            },
                            {
                              name: "金额（元）",
                              data: trend.map((p) => Number((p.totalAmount / 100).toFixed(2))),
                            },
                          ]}
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom variant="overline">
                      最近 30 天运营指标
                    </Typography>
                    {metrics ? (
                      <Stack spacing={1.5} sx={{ mt: 1 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="body2" color="text.secondary">
                            订单数
                          </Typography>
                          <Typography variant="body2">{metrics.totalOrders}</Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="body2" color="text.secondary">
                            成交金额
                          </Typography>
                          <Typography variant="body2">
                            ¥{(metrics.totalAmount / 100).toFixed(2)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="body2" color="text.secondary">
                            客单价
                          </Typography>
                          <Typography variant="body2">
                            ¥{(metrics.avgOrderValue / 100).toFixed(2)}
                          </Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="body2" color="text.secondary">
                            退单率
                          </Typography>
                          <Typography variant="body2">
                            {(metrics.cancelRate * 100).toFixed(1)}%
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="body2" color="text.secondary">
                            复购率
                          </Typography>
                          <Typography variant="body2">
                            {(metrics.repurchaseRate * 100).toFixed(1)}%
                          </Typography>
                        </Box>
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        正在加载运营指标...
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box>
              <CustomerFilter />
            </Box>
            <Box>
              <CustomerTabs
                tabs={[
                  {
                    key: 0,
                    isDefault: true,
                    label: "待处理",
                    children: (
                      <StoreOrderPendingTable setTrigger={() => setTrigger((c) => c + 1)} />
                    ),
                  },
                  {
                    key: 1,
                    isDefault: true,
                    label: "备货中",
                    children: <StoreOrderAcceptTable setTrigger={() => setTrigger((c) => c + 1)} />,
                  },
                  {
                    key: 2,
                    isDefault: true,
                    label: "运输中",
                    children: (
                      <StoreOrderDeliveryTable setTrigger={() => setTrigger((c) => c + 1)} />
                    ),
                  },
                  {
                    key: 3,
                    isDefault: true,
                    label: "已完成",
                    children: (
                      <StoreOrderFinishedTable setTrigger={() => setTrigger((c) => c + 1)} />
                    ),
                  },
                  {
                    key: 4,
                    isDefault: true,
                    label: "待收款",
                    children: (
                      <StoreOrderPaymentPendingTable setTrigger={() => setTrigger((c) => c + 1)} />
                    ),
                  },
                  {
                    key: 5,
                    isDefault: true,
                    label: "全部订单",
                    children: <StoreOrderAllTable setTrigger={() => setTrigger((c) => c + 1)} />,
                  },
                ]}
              />
            </Box>
          </Stack>
        </Container>
      </Box>
    </>
  );
}

Order.getLayout = (page: JSX.Element) => <DashboardLayout>{page}</DashboardLayout>;

export default Order;
