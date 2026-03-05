import React from "react";
import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { Chart } from "src/components/chart";
import { MonthlyTrendResponse } from "src/types/order-monthly-trend.type";

interface PlatformTrendChartProps {
  trend: MonthlyTrendResponse | null;
  onExport: () => void;
  loading?: boolean;
}

export function PlatformTrendChart({ trend, onExport, loading }: PlatformTrendChartProps) {
  const chartSeries = trend?.days
    ? [
        {
          name: "有效订单数",
          type: "column" as const,
          data: trend.days.map((d) => d.totalOrders),
        },
        {
          name: "订单总金额(元)",
          type: "line" as const,
          data: trend.days.map((d) => Number((d.totalAmount / 100).toFixed(2))),
        },
      ]
    : [];

  const chartOptions = {
    chart: {
      id: "monthly-orders-trend-platform",
      toolbar: { show: true },
      zoom: { enabled: false },
    },
    stroke: {
      width: [0, 3],
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: (trend?.days || []).map((d) => d.date.slice(8, 10)),
      title: { text: "日期" },
    },
    yaxis: [
      {
        seriesName: "有效订单数",
        title: { text: "订单数" },
      },
      {
        seriesName: "订单总金额(元)",
        opposite: true,
        title: { text: "金额(元)" },
      },
    ],
    tooltip: {
      shared: true,
      intersect: false,
    },
    legend: {
      position: "top" as const,
    },
  };

  return (
    <Card>
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography color="textSecondary" gutterBottom variant="overline">
            平台每日有效订单数 & 订单金额趋势
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={onExport}
            disabled={loading || !trend || !trend.days.length}
          >
            导出 Excel
          </Button>
        </Stack>
        {!trend || trend.days.length === 0 ? (
          <Box sx={{ py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              {loading ? "加载中..." : "暂无该月份的趋势数据。"}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ mt: 2 }}>
            <Chart options={chartOptions} series={chartSeries} type="line" height={420} />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
