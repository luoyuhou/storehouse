/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import Head from "next/head";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  AppBar,
} from "@mui/material";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { StoreSettlementSection } from "src/sections/settlement/store-settlement-section";
import { get } from "src/lib/http";
import { StoreType } from "src/types/store.type";
import { toast } from "react-toastify";
import SkeletonLoading from "src/components/loading/skeleton.loading";

function formatMoney(amount?: number) {
  if (amount === null || amount === undefined) return "-";
  return `¥${(amount / 100).toFixed(2)}`;
}

function formatCount(count?: number) {
  if (count === null || count === undefined) return "-";
  return count;
}

function StoreSettlementPage() {
  const [stats, setStats] = useState<{
    totalIncome: number;
    totalOrders: number;
    pendingSettlements: number;
  } | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [activeStoreId, setActiveStoreId] = useState<string>("");
  const [stores, setStores] = useState<StoreType[]>([]);
  const handleStoreChange = (_event: React.SyntheticEvent, newValue: string) => {
    setActiveStoreId(newValue);
  };

  useEffect(() => {
    get<{ data: StoreType[] }>("/api/store")
      .then((res) => {
        setStores(res.data);
        if (res.data.length > 0) {
          setActiveStoreId(res.data[0].store_id);
        }
      })
      .catch((err) => toast.error(err.message));
  }, []);

  useEffect(() => {
    if (!activeStoreId) return;

    setLoading(true);
    get<{
      totalIncome: number;
      totalOrders: number;
      pendingSettlements: number;
    }>(`/api/store/settlement/store/stats/${activeStoreId}`)
      .then((res) => setStats(res))
      .catch((err) => console.error("加载统计失败:", err))
      .finally(() => setLoading(false));
  }, [activeStoreId]);

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

          <AppBar position="static" color="default">
            <Tabs
              value={activeStoreId}
              onChange={handleStoreChange}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto"
            >
              {stores.map((store) => (
                <Tab key={store.store_id} value={store.store_id} label={store.store_name} />
              ))}
            </Tabs>
          </AppBar>

          {/* 统计卡片 */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    累计收入
                  </Typography>
                  <Typography variant="h4">
                    <SkeletonLoading loading={loading} variant="text" width={100}>
                      {formatMoney(stats?.totalIncome)}
                    </SkeletonLoading>
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
                    <SkeletonLoading loading={loading} variant="text" width={100}>
                      {formatCount(stats?.totalOrders)}
                    </SkeletonLoading>
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
                    <SkeletonLoading loading={loading} variant="text" width={100}>
                      {formatCount(stats?.pendingSettlements)}
                    </SkeletonLoading>
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
