import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import ComputerDesktopIcon from "@heroicons/react/24/solid/ComputerDesktopIcon";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Stack,
  SvgIcon,
  Typography,
  useTheme,
} from "@mui/material";
import { Chart } from "src/components/chart";
import { get } from "src/lib/http";
import { ChatBubbleLeftRightIcon, DeviceTabletIcon } from "@heroicons/react/24/outline";

const useChartOptions = (labels: string[]) => {
  const theme = useTheme();

  return {
    chart: {
      background: "transparent",
    },
    colors: [theme.palette.primary.main, theme.palette.success.main, theme.palette.warning.main],
    dataLabels: {
      enabled: false,
    },
    labels,
    legend: {
      show: false,
    },
    plotOptions: {
      pie: {
        expandOnClick: false,
      },
    },
    states: {
      active: {
        filter: {
          type: "none",
        },
      },
      hover: {
        filter: {
          type: "none",
        },
      },
    },
    stroke: {
      width: 0,
    },
    theme: {
      mode: theme.palette.mode,
    },
    tooltip: {
      fillSeriesColor: false,
    },
  };
};

type OverviewTrafficLabelType = "Desktop" | "Mobile" | "Wechat";

const iconMap = {
  Desktop: (
    <SvgIcon>
      <ComputerDesktopIcon />
    </SvgIcon>
  ),
  Mobile: (
    <SvgIcon>
      <DeviceTabletIcon />
    </SvgIcon>
  ),
  Wechat: (
    <SvgIcon>
      <ChatBubbleLeftRightIcon />
    </SvgIcon>
  ),
};

export function OverviewTraffic(props: { sx: { height: string } }) {
  const theme = useTheme();
  const [chartSeries, setChartSeries] = useState([0, 0, 0]);
  const labels: { color: string; label: OverviewTrafficLabelType }[] = [
    { color: theme.palette.primary.main, label: "Mobile" },
    { color: theme.palette.success.main, label: "Desktop" },
    { color: theme.palette.warning.main, label: "Wechat" },
  ];
  const { sx } = props;
  const chartOptions = useChartOptions(labels.map(({ label }) => label));

  useEffect(() => {
    get<{ data: { source: number; _count: number }[] }>("/api/users/users-fetch/realtime").then(
      ({ data }) => {
        const emptyData = [
          { source: 0, _count: 0 },
          { source: 1, _count: 0 },
          { source: 2, _count: 0 },
        ];
        const newData = emptyData.map(({ source }) => {
          const find = data.find((item) => item.source === source);
          return find ?? { _count: 0, source };
        });
        setChartSeries(newData.map(({ _count }) => _count));
      },
    );
  }, []);

  return (
    <Card sx={sx}>
      <CardHeader title="Traffic Source" />
      <CardContent className="mt-[82px]">
        <Chart height={300} options={chartOptions} series={chartSeries} type="donut" width="100%" />
        <Stack
          alignItems="center"
          direction="row"
          justifyContent="center"
          spacing={2}
          sx={{ mt: 2 }}
        >
          {chartSeries.map((item, index) => {
            const { label, color } = labels[index];

            return (
              <Box
                key={label}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  color,
                }}
              >
                {iconMap[label]}
                <Typography sx={{ my: 1, color }} variant="h6">
                  {label}
                </Typography>
                <Typography color="text.secondary" variant="subtitle2">
                  {((item * 100) / (chartSeries.reduce((s, t) => s + t, 0) || 100)).toFixed(2)}%
                </Typography>
              </Box>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}

OverviewTraffic.propTypes = {
  sx: PropTypes.object,
};
