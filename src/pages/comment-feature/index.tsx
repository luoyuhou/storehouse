import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import React from "react";
import Head from "next/head";
import { Box, Container, Stack, Typography, Unstable_Grid2 as Grid } from "@mui/material";

function CommentOrFeature() {
  return (
    <>
      <Head>
        <title>Feature | Comment</title>
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
              <Typography variant="h4">开发中...</Typography>
            </div>
            <div>
              <Grid container spacing={3}>
                敬请期待!!!
              </Grid>
            </div>
          </Stack>
        </Container>
      </Box>
    </>
  );
}

CommentOrFeature.getLayout = (page: JSX.Element) => <DashboardLayout>{page}</DashboardLayout>;

export default CommentOrFeature;
