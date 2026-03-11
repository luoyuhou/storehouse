import React from "react";
import PropTypes from "prop-types";
import { Box, Card, CardContent, CardHeader, CircularProgress, useTheme } from "@mui/material";
import { Chart } from "src/components/chart";
import { ApexOptions } from "apexcharts";

export function RetentionRateChart({
  data,
  loading,
}: {
  data: { date: string; day1: number; day3: number; day7: number; newUsers: number }[] | undefined;
  loading: boolean;
}) {
  const theme = useTheme();
  const safeData = Array.isArray(data) ? data : [];

  const chartOptions: ApexOptions = {
    // ... chart configuration ...
    chart: {
      background: "transparent",
      stacked: false,
      toolbar: {
        show: false,
      },
    },
    colors: [
      theme.palette.primary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.error.main,
    ],
    dataLabels: {
      enabled: false,
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.5,
        gradientToColors: undefined,
        inverseColors: true,
        opacityFrom: 0.5,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 2,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "center",
    },
    markers: {
      size: 4,
      strokeColors: theme.palette.background.default,
      strokeWidth: 2,
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    theme: {
      mode: theme.palette.mode as "light" | "dark",
    },
    xaxis: {
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      categories: safeData.map((item) => item.date),
      labels: {
        offsetY: 5,
        style: {
          colors: theme.palette.text.secondary,
        },
      },
    },
    yaxis: {
      title: {
        text: "数值",
      },
      labels: {
        formatter: (value: number) => (value !== undefined ? value.toFixed(1) : "0"),
        style: {
          colors: theme.palette.text.secondary,
        },
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value: number, options?: { seriesIndex: number }) => {
          if (value === undefined || value === null) return "0";
          const seriesIndex = options?.seriesIndex;
          if (seriesIndex === 0) return `${value} 人`;
          return `${value.toFixed(2)}%`;
        },
      },
    },
  };

  const chartSeries = [
    {
      name: "新用户数",
      type: "column",
      data: safeData.map((item) => item.newUsers || 0),
    },
    {
      name: "次日留存",
      type: "line",
      data: safeData.map((item) => item.day1 || 0),
    },
    {
      name: "3日留存",
      type: "line",
      data: safeData.map((item) => item.day3 || 0),
    },
    {
      name: "7日留存",
      type: "line",
      data: safeData.map((item) => item.day7 || 0),
    },
  ];

  return (
    <Card sx={{ position: "relative" }}>
      <CardHeader title="用户留存率分析 (过去30天)" />
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
        <Chart height={350} options={chartOptions} series={chartSeries} type="line" width="100%" />
      </CardContent>
    </Card>
  );
}

RetentionRateChart.propTypes = {
  data: PropTypes.array,
  loading: PropTypes.bool,
};
