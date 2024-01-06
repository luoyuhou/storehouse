import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import React from "react";
import Head from "next/head";
import { Box, Container, Stack, Typography, Unstable_Grid2 as Grid } from "@mui/material";

function Category() {
  return (
    <>
      <Head>
        <title>Category</title>
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
              <Typography variant="h4">Category</Typography>
            </div>
          </Stack>
        </Container>
      </Box>
    </>
  );
}

Category.getLayout = (page: JSX.Element) => <DashboardLayout>{page}</DashboardLayout>;

export default Category;
