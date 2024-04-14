import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import ComputerDesktopIcon from "@heroicons/react/24/solid/ComputerDesktopIcon";
import DeviceTabletIcon from "@heroicons/react/24/solid/DeviceTabletIcon";
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
import { CommandLineIcon } from "@heroicons/react/24/outline";

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

type OverviewTrafficLabelType = "Desktop" | "Other" | "Wechat";

const iconMap = {
  Desktop: (
    <SvgIcon>
      <ComputerDesktopIcon />
    </SvgIcon>
  ),
  Other: (
    <SvgIcon>
      <CommandLineIcon />
    </SvgIcon>
  ),
  Wechat: (
    <SvgIcon>
      <DeviceTabletIcon />
    </SvgIcon>
  ),
};

export function OverviewTraffic(props: { sx: { height: string } }) {
  const [chartSeries, setChartSeries] = useState([0, 0]);
  const labels: OverviewTrafficLabelType[] = ["Desktop", "Wechat", "Other"];
  const { sx } = props;
  const chartOptions = useChartOptions(labels);

  useEffect(() => {
    console.log("chartSeries", chartSeries);
  }, [chartSeries]);

  useEffect(() => {
    get<{ data: { source: number; _count: number }[] }>("/api/users/users-fetch/realtime").then(
      ({ data }) => {
        const list = data.sort((a, b) => a.source - b.source).map(({ _count }) => _count);
        setChartSeries([...list, 0]);
      },
    );
  }, []);

  return (
    <Card sx={sx}>
      <CardHeader title="Traffic Source" />
      <CardContent>
        <Chart height={300} options={chartOptions} series={chartSeries} type="donut" width="100%" />
        <Stack
          alignItems="center"
          direction="row"
          justifyContent="center"
          spacing={2}
          sx={{ mt: 2 }}
        >
          {chartSeries.map((item, index) => {
            const label = labels[index];

            return (
              <Box
                key={label}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                {iconMap[label]}
                <Typography sx={{ my: 1 }} variant="h6">
                  {label}
                </Typography>
                <Typography color="text.secondary" variant="subtitle2">
                  {((item * 100) / chartSeries.reduce((s, t) => s + t, 0)).toFixed(2)}%
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
