/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import Head from "next/head";
import { AppBar, Box, Container, Tab, Tabs, Typography } from "@mui/material";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { StoreServicePlansSection } from "src/sections/store-service/store-service-plans-section";
import { StoreServiceSubscriptionsSection } from "src/sections/store-service/store-service-subscriptions-section";
import { StoreServiceInvoicesSection } from "src/sections/store-service/store-service-invoices-section";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`store-service-tabpanel-${index}`}
      aria-labelledby={`store-service-tab-${index}`}
      {...other}
    >
      {value === index && <Box pt={3}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `store-service-tab-${index}`,
    "aria-controls": `store-service-tabpanel-${index}`,
  };
}

function StoreServiceManagePage() {
  const [value, setValue] = React.useState(0);

  return (
    <>
      <Head>
        <title>店铺服务管理</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Typography variant="h4" mb={3}>
            店铺服务管理
          </Typography>

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
              <Tab label="店铺订阅" {...a11yProps(0)} />
              <Tab label="账单列表" {...a11yProps(1)} />
              <Tab label="店铺服务套餐" {...a11yProps(2)} />
            </Tabs>
          </AppBar>

          <TabPanel value={value} index={0}>
            <StoreServiceSubscriptionsSection />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <StoreServiceInvoicesSection />
          </TabPanel>
          <TabPanel value={value} index={2}>
            <StoreServicePlansSection />
          </TabPanel>
        </Container>
      </Box>
    </>
  );
}

(StoreServiceManagePage as any).getLayout = (page: JSX.Element) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default StoreServiceManagePage;
