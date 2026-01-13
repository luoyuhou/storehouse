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

function Order() {
  const [trigger, setTrigger] = useState(0);
  const [statistics, setStatistics] = useState({
    pending: 0,
    stocking: 0,
    shipping: 0,
    finished: 0,
    total: 0,
    totalAmount: 0,
  });

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
