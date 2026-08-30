import React from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Typography,
  useTheme,
} from "@mui/material";
import { Chart } from "src/components/chart";
import { ApexOptions } from "apexcharts";

export type OnlineCountPoint = {
  time: string;
  count: number;
  sampled_at?: string;
};

export function OnlineCountChart({
  data,
  current,
  loading,
}: {
  data: OnlineCountPoint[] | undefined;
  current?: number;
  loading: boolean;
}) {
  const theme = useTheme();
  const safeData = Array.isArray(data) ? data : [];

  const chartOptions: ApexOptions = {
    chart: {
      background: "transparent",
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: [theme.palette.primary.main],
    dataLabels: { enabled: false },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.4,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 2,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    legend: { show: false },
    markers: {
      size: 3,
      hover: { size: 6 },
      strokeColors: theme.palette.background.default,
      strokeWidth: 2,
    },
    stroke: {
      curve: "smooth",
      width: 5,
    },
    theme: {
      mode: theme.palette.mode as "light" | "dark",
    },
    xaxis: {
      axisBorder: { show: false },
      axisTicks: { show: false },
      categories: safeData.map((item) => item.time),
      labels: {
        rotate: -45,
        rotateAlways: safeData.length > 12,
        hideOverlappingLabels: true,
        style: { colors: theme.palette.text.secondary, fontSize: "11px" },
      },
      tickAmount: Math.min(8, Math.max(safeData.length - 1, 1)),
    },
    yaxis: {
      min: 0,
      forceNiceScale: true,
      title: { text: "在线人数" },
      labels: {
        formatter: (value: number) => `${Math.round(value || 0)}`,
        style: { colors: theme.palette.text.secondary },
      },
    },
    tooltip: {
      y: {
        formatter: (value: number) => `${Math.round(value || 0)} 人`,
      },
    },
  };

  const chartSeries = [
    {
      name: "在线人数",
      data: safeData.map((item) => item.count || 0),
    },
  ];

  return (
    <Card sx={{ position: "relative" }}>
      <CardHeader
        title="在线人数统计 (近24小时)"
        subheader={
          typeof current === "number" ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              当前在线：{current} 人 · 每 5 分钟采样
            </Typography>
          ) : (
            "每 5 分钟采样"
          )
        }
      />
      <CardContent sx={{ minHeight: 350 }}>
        {loading && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255, 255, 255, 0.6)",
              zIndex: 1,
              borderRadius: 1,
            }}
          >
            <CircularProgress />
          </Box>
        )}
        {!loading && safeData.length === 0 ? (
          <Box
            sx={{
              height: 350,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography color="text.secondary">暂无采样数据，请等待定时任务写入</Typography>
          </Box>
        ) : (
          <Chart
            height={350}
            options={chartOptions}
            series={chartSeries}
            type="line"
            width="100%"
          />
        )}
      </CardContent>
    </Card>
  );
}
