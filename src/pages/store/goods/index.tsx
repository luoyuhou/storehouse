import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import React, { useEffect, useState } from "react";
import Head from "next/head";
import { AppBar, Box, Container, Stack, Tab, Tabs, Typography } from "@mui/material";
import { get } from "src/lib/http";
import { toast } from "react-toastify";
import { StoreType } from "src/types/store.type";
import CustomerTabs from "src/components/tabs/customer-tabs";
import CircularPercentageLoading from "src/components/loading/circular-percentage.loading";
import GoodsListTable from "src/sections/goods/goods-list";
import { GoodsCreateForm } from "src/sections/goods/goods.create";

function GoodsPage() {
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState<StoreType[]>([]);
  const [activeStoreId, setActiveStoreId] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    get<{ data: StoreType[] }>("/api/store")
      .then((res) => {
        setStores(res.data);
        if (res.data.length > 0) {
          setActiveStoreId(res.data[0].store_id);
        }
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleStoreChange = (_event: React.SyntheticEvent, newValue: string) => {
    setActiveStoreId(newValue);
  };

  return (
    <>
      <Head>
        <title>商品管理</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 2,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Typography variant="h4">商品管理</Typography>

            <CircularPercentageLoading loading={loading}>
              {stores.length > 0 ? (
                <>
                  {/* 商铺选择 Tabs (原生 MUI Tabs) */}
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

                  {/* 商品列表/创建商品 Tabs */}
                  <CustomerTabs
                    tabs={[
                      {
                        key: "list",
                        label: "商品列表",
                        isDefault: true,
                        children: <GoodsListTable storeId={activeStoreId} />,
                      },
                      {
                        key: "create",
                        label: "创建商品",
                        children: <GoodsCreateForm stores={stores} storeId={activeStoreId} />,
                      },
                    ]}
                  />
                </>
              ) : (
                <Typography color="textSecondary">暂无店铺数据</Typography>
              )}
            </CircularPercentageLoading>
          </Stack>
        </Container>
      </Box>
    </>
  );
}

GoodsPage.getLayout = (page: JSX.Element) => <DashboardLayout>{page}</DashboardLayout>;

export default GoodsPage;
