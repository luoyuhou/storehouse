import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import React from "react";
import Head from "next/head";
import { Box, Button, Container, Stack, SvgIcon, Typography } from "@mui/material";
import CustomerTabs from "src/components/tabs/customer-tabs";
import StoreOrderPendingTable from "src/sections/store/order/order-pending.table";
import StoreOrderProgressTable from "src/sections/store/order/progress-pending.table";
import StoreOrderFinishedTable from "src/sections/store/order/order-finished.table";
import StoreOrderAllTable from "src/sections/store/order/order-all.table";
import { CustomerFilter } from "src/components/filter/customer-filter";
import ArrowUpOnSquareIcon from "@heroicons/react/24/solid/ArrowUpOnSquareIcon";
import ArrowDownOnSquareIcon from "@heroicons/react/24/solid/ArrowDownOnSquareIcon";

function Order() {
  return (
    <>
      <Head>
        <title>Order</title>
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
                <Typography variant="h4">订单</Typography>
                <Stack alignItems="center" direction="row" spacing={1}>
                  <Button
                    color="inherit"
                    startIcon={
                      <SvgIcon fontSize="small">
                        <ArrowUpOnSquareIcon />
                      </SvgIcon>
                    }
                  >
                    Import
                  </Button>
                  <Button
                    color="inherit"
                    startIcon={
                      <SvgIcon fontSize="small">
                        <ArrowDownOnSquareIcon />
                      </SvgIcon>
                    }
                  >
                    Export
                  </Button>
                </Stack>
              </Stack>
            </Stack>
            <Box>
              <CustomerFilter />
            </Box>
            <Box>
              <CustomerTabs
                tabs={[
                  {
                    key: 0,
                    isDefault: true,
                    label: "等待处理",
                    children: <StoreOrderPendingTable />,
                  },
                  {
                    key: 1,
                    isDefault: true,
                    label: "处理中",
                    children: <StoreOrderProgressTable />,
                  },
                  {
                    key: 2,
                    isDefault: true,
                    label: "处理完成",
                    children: <StoreOrderFinishedTable />,
                  },
                  { key: 3, isDefault: true, label: "所有订单", children: <StoreOrderAllTable /> },
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
