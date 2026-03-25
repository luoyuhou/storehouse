/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import Head from "next/head";
import { Box, Container, Typography, Card, CardContent, Grid, Skeleton } from "@mui/material";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { StoreSettlementSection } from "src/sections/settlement/store-settlement-section";
import { get } from "src/lib/http";

function StoreSettlementPage() {
  const [stats, setStats] = useState<{
    totalIncome: number;
    totalOrders: number;
    pendingSettlements: number;
  } | null>(null);

  useEffect(() => {
    // 获取店铺ID - 从本地存储或上下文获取
    const storeId = localStorage.getItem("store_id");
    if (!storeId) return;

    get<{
      totalIncome: number;
      totalOrders: number;
      pendingSettlements: number;
    }>(`/api/store/settlement/store/stats/${storeId}`)
      .then((res) => setStats(res))
      .catch((err) => console.error("加载统计失败:", err));
  }, []);

  const formatMoney = (amount: number) => `¥${(amount / 100).toFixed(2)}`;

  return (
    <>
      <Head>
        <title>商家结算</title>
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
            商家结算
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            用户直接支付到商家，平台不介入。此处展示您的月度收入结算记录。
          </Typography>

          {/* 统计卡片 */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    累计收入
                  </Typography>
                  <Typography variant="h4">
                    {stats ? (
                      formatMoney(stats.totalIncome)
                    ) : (
                      <Skeleton variant="text" width={100} />
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    累计订单
                  </Typography>
                  <Typography variant="h4">
                    {stats ? stats.totalOrders : <Skeleton variant="text" width={100} />}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    待确认结算
                  </Typography>
                  <Typography variant="h4">
                    {stats ? stats.pendingSettlements : <Skeleton variant="text" width={100} />}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <StoreSettlementSection />
        </Container>
      </Box>
    </>
  );
}

(StoreSettlementPage as any).getLayout = (page: JSX.Element) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default StoreSettlementPage;
