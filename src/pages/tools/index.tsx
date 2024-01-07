import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import React from "react";
import Head from "next/head";
import { Box, Container, Stack, Typography, Unstable_Grid2 as Grid } from "@mui/material";
import { AccountProfile } from "src/sections/account/account-profile";
import { AccountProfileDetails } from "src/sections/account/account-profile-details";

function Tools() {
  return (
    <>
      <Head>
        <title>Tools</title>
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
              <Typography variant="h4">Tools</Typography>
            </div>
            <div>
              <Grid container spacing={3}>
                <Grid xs={12} md={6} lg={4}>
                  <AccountProfile />
                </Grid>
                <Grid xs={12} md={6} lg={8}>
                  <AccountProfileDetails />
                </Grid>
              </Grid>
            </div>
          </Stack>
        </Container>
      </Box>
    </>
  );
}

Tools.getLayout = (page: JSX.Element) => <DashboardLayout>{page}</DashboardLayout>;

export default Tools;
