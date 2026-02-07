import React from "react";
import Head from "next/head";
import { Box, Container, Stack, Typography } from "@mui/material";
import { SettingsNotifications } from "../sections/settings/settings-notifications";
import { SettingsPassword } from "../sections/settings/settings-password";
import { Layout as DashboardLayout } from "../layouts/dashboard/layout";

function Page() {
  return (
    <>
      <Head>
        <title>Settings | Devias Kit</title>
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
            <Typography variant="h4">Settings</Typography>
            <SettingsNotifications />
            <SettingsPassword />
          </Stack>
        </Container>
      </Box>
    </>
  );
}

Page.getLayout = (page: JSX.Element) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
