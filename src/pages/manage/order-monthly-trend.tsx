import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import React, { useState } from "react";
import Head from "next/head";
import { Box, Card, CardContent, Container, Stack, Tab, Tabs, Typography } from "@mui/material";
import { PlatformTab } from "src/sections/order-monthly-trend/PlatformTab";
import { StoreTab } from "src/sections/order-monthly-trend/StoreTab";

function ManageOrderMonthlyTrendPage() {
  const [activeTab, setActiveTab] = useState<string>("platform");

  return (
    <>
      <Head>
        <title>订单趋势（后台）</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 2,
        }}
      >
        <Container sx={{ maxWidth: "1600px !important" }}>
          <Stack spacing={3}>
            {/* 顶部标题区域 */}
            <Stack spacing={1}>
              <Typography variant="h4">订单趋势（后台管理视角）</Typography>
              <Typography variant="body2" color="text.secondary">
                查看某个月内平台每日有效订单数与订单总金额趋势，可切换标签查看全平台或指定商家的趋势并导出
                Excel。
              </Typography>
            </Stack>

            {/* 标签页 */}
            <Card>
              <CardContent sx={{ p: 0 }}>
                <Tabs
                  value={activeTab}
                  onChange={(event, newValue) => setActiveTab(newValue)}
                  sx={{ borderBottom: 1, borderColor: "divider" }}
                >
                  <Tab label="全平台" value="platform" />
                  <Tab label="单个商家" value="store" />
                </Tabs>
                <Box sx={{ p: 3 }}>
                  {activeTab === "platform" && <PlatformTab />}
                  {activeTab === "store" && <StoreTab />}
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Container>
      </Box>
    </>
  );
}

ManageOrderMonthlyTrendPage.getLayout = (page: JSX.Element) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default ManageOrderMonthlyTrendPage;
