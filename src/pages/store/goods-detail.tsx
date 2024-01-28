import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import React from "react";
import Head from "next/head";
import { Box, Container, Stack, Typography, Unstable_Grid2 as Grid } from "@mui/material";
import { useRouter } from "next/router";
import { GoodsDetailEditing } from "src/sections/goods/goods-detail.editing";
import { GoodsVersionsEditing } from "src/sections/goods/goods-versions.editing";

function GoodsDetail() {
  const router = useRouter();
  const { id } = router.query;
  return (
    <>
      <Head>
        <title>GoodsDetail</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={3}>
            <div>
              <Typography variant="h4">商品详情</Typography>
            </div>
            <GoodsDetailEditing id={id as string} />
            <GoodsVersionsEditing id={id as string} />
          </Stack>
        </Container>
      </Box>
    </>
  );
}

GoodsDetail.getLayout = (page: JSX.Element) => <DashboardLayout>{page}</DashboardLayout>;

export default GoodsDetail;
