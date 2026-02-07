import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import React from "react";
import Head from "next/head";
import { Box, Container, Stack, Typography, Unstable_Grid2 as Grid } from "@mui/material";
import { CardNav } from "src/components/card-nav";

function Apply() {
  return (
    <>
      <Head>
        <title>Apply</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 3,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <div>
              <Typography variant="h4">服务订阅</Typography>
            </div>
            <div>
              <Grid container spacing={3}>
                <Grid xs={12} md={6} lg={4}>
                  <CardNav
                    dashboardUrl="/apply/store/list"
                    url="/apply/store"
                    imgUrl="/assets/store-logo.png"
                    title="商铺"
                    description="同城配送, 线上商铺, 方便在线下单"
                    dialogTitle="商店详情"
                  >
                    <Grid xs={12} md={6} lg={4} p={2}>
                      <Grid>1. 填写提交相关信息.</Grid>
                      <Grid>2. 等待管理员审核.</Grid>
                      <Grid>3. 自己分类, 管理商品.</Grid>
                    </Grid>
                  </CardNav>
                </Grid>
                <Grid xs={12} md={6} lg={4}>
                  <CardNav
                    url="#"
                    disabled
                    imgUrl="/assets/expect.png"
                    title="敬请期待"
                    description="敬请期待..."
                    dialogTitle="敬请期待"
                  >
                    <Grid xs={12} md={6} lg={4} p={2} />
                  </CardNav>
                </Grid>
              </Grid>
            </div>
          </Stack>
        </Container>
      </Box>
    </>
  );
}

Apply.getLayout = (page: JSX.Element) => <DashboardLayout>{page}</DashboardLayout>;

export default Apply;
