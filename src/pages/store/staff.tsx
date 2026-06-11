import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import React, { useEffect } from "react";
import Head from "next/head";
import { Box, Container, Unstable_Grid2 as Grid, Stack, Typography } from "@mui/material";
import { CompanyBasicInfoNav } from "src/sections/companies/company-basic-info-nav";
import { StoreType } from "src/types/store.type";
import { get } from "src/lib/http";
import { toast } from "react-toastify";
import CircularPercentageLoading from "src/components/loading/circular-percentage.loading";
import { StaffManagement } from "src/sections/staff/staff-management";

function Page() {
  const [storeLoading, setStoreLoading] = React.useState(false);
  const [stores, setStores] = React.useState<StoreType[]>([]);
  const [storeId, setStoreId] = React.useState<string>("");

  useEffect(() => {
    setStoreLoading(true);
    get<{ data: StoreType[] }>("/api/store")
      .then((res) => setStores(res.data))
      .catch((err) => toast.error(err.message))
      .finally(() => setStoreLoading(false));
  }, []);

  return (
    <>
      <Head>
        <title>收银员管理 | 商店管理</title>
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
            <div>
              <Typography variant="h4" mb={2}>
                收银员管理
              </Typography>
            </div>
            <Box sx={{ flexGrow: 1 }}>
              <CircularPercentageLoading loading={storeLoading}>
                <Grid container spacing={3}>
                  <Grid xs={12} md={5} lg={5}>
                    <CompanyBasicInfoNav stores={stores} setStoreId={setStoreId} />
                  </Grid>
                  <Grid xs={12} md={7} lg={7}>
                    <StaffManagement storeId={storeId} />
                  </Grid>
                </Grid>
              </CircularPercentageLoading>
            </Box>
          </Stack>
        </Container>
      </Box>
    </>
  );
}

Page.getLayout = (page: JSX.Element) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
