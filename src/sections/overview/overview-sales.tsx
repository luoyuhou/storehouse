import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import ArrowPathIcon from "@heroicons/react/24/solid/ArrowPathIcon";
import ArrowRightIcon from "@heroicons/react/24/solid/ArrowRightIcon";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  SvgIcon,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { Chart } from "src/components/chart";
import { useAuthContext } from "src/contexts/auth-context";
import { post } from "src/lib/http";
import { UserSessionType } from "src/types/users";
import { format, subDays } from "date-fns";
import CustomerTabs from "src/components/tabs/customer-tabs";

const useChartOptions = (categories: string[]) => {
  const theme = useTheme();

  return {
    chart: {
      background: "transparent",
      stacked: false,
      toolbar: {
        show: false,
      },
    },
    colors: [theme.palette.primary.main, alpha(theme.palette.primary.main, 0.25)],
    dataLabels: {
      enabled: false,
    },
    fill: {
      opacity: 1,
      type: "solid",
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
      show: false,
    },
    plotOptions: {
      bar: {
        columnWidth: "40px",
      },
    },
    stroke: {
      colors: ["transparent"],
      show: true,
      width: 2,
    },
    theme: {
      mode: theme.palette.mode,
    },
    xaxis: {
      axisBorder: {
        color: theme.palette.divider,
        show: true,
      },
      axisTicks: {
        color: theme.palette.divider,
        show: true,
      },
      categories,
      labels: {
        offsetY: 5,
        style: {
          colors: theme.palette.text.secondary,
        },
      },
    },
    yaxis: {
      labels: {
        formatter: (value: number) => (value > 0 ? `${value.toFixed(0)}` : `${value.toFixed(0)}`),
        offsetX: -10,
        style: {
          colors: theme.palette.text.secondary,
        },
      },
    },
  };
};

let date = new Date();
const categories: string[] = [];
// eslint-disable-next-line no-plusplus
for (let i = 0; i < 10; i++) {
  date = subDays(date, 1);
  categories.unshift(format(date, "yyyy-MM-dd"));
}

export function OverviewSales(props: { sx: { height: string } }) {
  const { sx } = props;
  const chartOptions = useChartOptions(categories.map((c) => c.slice(5)));

  const { user } = useAuthContext();
  const [data, setData] = useState<{ date: string; times: number; use_time: number }[]>([]);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (!user) {
      return;
    }

    post<{ data: { record_date: Date; times: number; use_time: number }[] }>({
      url: "/api/users/users-fetch/pagination",
      payload: {
        pageNum: 0,
        pageSize: 10,
        filtered: [{ id: "user_id", value: (user as unknown as UserSessionType)?.id }],
        sorted: [{ id: "create_date", desc: true }],
      },
    })
      .then(({ data: list }) => {
        setData(
          categories.map((d) => {
            const find = list.find((item) => {
              return format(new Date(item.record_date), "yyyy-MM-dd") === d;
            });

            return { date: d.slice(5), times: find?.times ?? 0, use_time: find?.use_time ?? 0 };
          }),
        );
      })
      .catch()
      .finally();
  }, [trigger]);

  return (
    <Card sx={sx}>
      <CardHeader
        action={
          <Button
            color="inherit"
            size="small"
            startIcon={
              <SvgIcon fontSize="small">
                <ArrowPathIcon />
              </SvgIcon>
            }
            onClick={() => setTrigger((c) => c + 1)}
          >
            Sync
          </Button>
        }
        title="最近 10 天使用统计"
      />
      <CardContent>
        <CustomerTabs
          tabs={[
            {
              key: 0,
              label: "请求次数",
              isDefault: true,
              children: (
                <Chart
                  height={350}
                  options={chartOptions}
                  series={[{ name: "请求次数", data: data.map(({ times }) => times) }]}
                  type="bar"
                  width="100%"
                />
              ),
            },
            {
              key: 1,
              label: "使用时长",
              children: (
                <Chart
                  height={350}
                  options={chartOptions}
                  series={[
                    {
                      name: "使用时长",
                      data: data.map(({ use_time }) => use_time),
                    },
                  ]}
                  type="bar"
                  width="100%"
                />
              ),
            },
          ]}
        />
      </CardContent>
      <Divider />
      <CardActions sx={{ justifyContent: "flex-end" }}>
        <Button
          color="inherit"
          endIcon={
            <SvgIcon fontSize="small">
              <ArrowRightIcon />
            </SvgIcon>
          }
          size="small"
        >
          Overview
        </Button>
      </CardActions>
    </Card>
  );
}

OverviewSales.protoTypes = {
  chartSeries: PropTypes.array.isRequired,
  sx: PropTypes.object,
};
