import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import React from "react";
import Head from "next/head";
import { Box, Container, Stack, Typography } from "@mui/material";
import { CustomerTabs } from "src/components/tabs/customer-tabs";
import StoreOrderPendingTable from "src/sections/store/order/order-pending.table";
import StoreOrderProgressTable from "src/sections/store/order/progress-pending.table";
import StoreOrderFinishedTable from "src/sections/store/order/order-finished.table";
import StoreOrderAllTable from "src/sections/store/order/order-all.table";

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
          py: 8,
        }}
      >
        <Container style={{ maxWidth: "1400px" }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4">Order</Typography>
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
