/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from "react";
import Head from "next/head";
import { AppBar, Box, Container, Stack, Tab, Tabs, Typography } from "@mui/material";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { StoreServicePlansSection } from "src/sections/store-service/store-service-plans-section";

function a11yProps(index: number) {
  return {
    id: `store-service-tab-${index}`,
    "aria-controls": `store-service-tabpanel-${index}`,
  };
}

function StoreServiceManagePage() {
  const [value, setValue] = React.useState(0);

  const tabs = useMemo(
    () => [{ key: 0, label: "服务套餐", component: <StoreServicePlansSection /> }],
    [],
  );

  const currentTab = tabs.find((tab) => tab.key === value);

  return (
    <>
      <Head>
        <title>店铺服务管理</title>
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
            套餐服务管理
          </Typography>

          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="subtitle1" color="text.secondary">
              服务套餐用于用户订阅
            </Typography>
          </Stack>

          <AppBar position="static" color="default">
            <Tabs
              value={value}
              onChange={(e, v) => setValue(v)}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto"
              aria-label="store service tabs"
            >
              {tabs.map((tab) => (
                <Tab key={tab.key} label={tab.label} {...a11yProps(tab.key)} />
              ))}
            </Tabs>
          </AppBar>

          <Box sx={{ pt: 3 }}>{currentTab?.component}</Box>
        </Container>
      </Box>
    </>
  );
}

(StoreServiceManagePage as any).getLayout = (page: JSX.Element) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default StoreServiceManagePage;
