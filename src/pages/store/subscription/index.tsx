import React, { useEffect, useState } from "react";
import Head from "next/head";
import { Box, Container, Stack, Typography, Card } from "@mui/material";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { get } from "src/lib/http";
import { toast } from "react-toastify";
import CustomerTabs from "src/components/tabs/customer-tabs";
import CircularPercentageLoading from "src/components/loading/circular-percentage.loading";
import { StoreSubscriptionPlan, StoreType } from "src/types/store.type";
import { StoreSubscriptionContent } from "src/sections/store/store-subscription/store-subscription-content";

function Page() {
  const [stores, setStores] = useState<StoreType[]>([]);
  const [plans, setPlans] = useState<StoreSubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      get<{ data: StoreType[] }>("/api/store"),
      get<{ data: StoreSubscriptionPlan[] }>("/api/store/service/plans"),
    ])
      .then(([storesRes, plansRes]) => {
        setStores(storesRes.data || []);
        setPlans(plansRes.data || []);
      })
      .catch((err) => {
        toast.error(`加载基础数据失败: ${err.message}`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Head>
        <title>服务订阅 | 商店管理</title>
      </Head>
      <Box component="main" sx={{ flexGrow: 1, py: 2 }}>
        <Container maxWidth="xl">
          <Stack spacing={4}>
            <Box>
              <Typography variant="h4">服务订阅管理</Typography>
              <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 1 }}>
                升级商铺服务，解锁每日无限下单额度。
              </Typography>
            </Box>

            <CircularPercentageLoading loading={loading}>
              {stores.length > 0 ? (
                <CustomerTabs
                  tabs={stores.map((store, index) => ({
                    key: index,
                    label: store.store_name,
                    isDefault: index === 0,
                    children: <StoreSubscriptionContent storeId={store.store_id} plans={plans} />,
                  }))}
                />
              ) : (
                <Card sx={{ p: 4, textAlign: "center" }}>
                  <Typography color="textSecondary">
                    您目前没有已审核通过的商铺，请先创建商铺并等待审核。
                  </Typography>
                </Card>
              )}
            </CircularPercentageLoading>
          </Stack>
        </Container>
      </Box>
    </>
  );
}

Page.getLayout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
