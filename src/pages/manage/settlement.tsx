/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import Head from "next/head";
import { Box, Container, Typography } from "@mui/material";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { PlatformSettlementSection } from "src/sections/settlement/platform-settlement-section";

function PlatformSettlementPage() {
  return (
    <>
      <Head>
        <title>平台结算</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 3,
        }}
      >
        <Container maxWidth="xl">
          <Typography variant="h4" mb={3}>
            平台结算
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            平台收入来源：
            <br />
            1. 商家订阅套餐费用
            <br />
            2. 商家购买图片资源
            <br />
            3. 订单服务费（每天10单免费，超出部分每天0.1元）
          </Typography>

          <PlatformSettlementSection />
        </Container>
      </Box>
    </>
  );
}

(PlatformSettlementPage as any).getLayout = (page: JSX.Element) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default PlatformSettlementPage;
