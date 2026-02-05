import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import React, { useEffect } from "react";
import Head from "next/head";
import { Box, Container, Stack, Typography, Unstable_Grid2 as Grid } from "@mui/material";
import { get } from "src/lib/http";
import { toast } from "react-toastify";
import CircularPercentageLoading from "src/components/loading/circular-percentage.loading";
import { StoreType } from "src/types/store.type";
import { CompanyBasicInfoNav } from "src/sections/companies/company-basic-info-nav";
import { CompanyHistoryTable } from "src/sections/companies/company-history-table";

function StoreHistory() {
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
        <title>店铺操作日志</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 2,
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={3}>
            <div>
              <Typography variant="h4" mb={2}>
                店铺操作日志
              </Typography>
              <Typography variant="body2" color="text.secondary">
                查看当前商家下各店铺的历史操作记录，便于审计与问题排查。
              </Typography>
            </div>
            <Box sx={{ flexGrow: 1 }}>
              <CircularPercentageLoading loading={storeLoading}>
                <Grid container spacing={3}>
                  <Grid xs={12} md={5} lg={5}>
                    <CompanyBasicInfoNav stores={stores} setStoreId={setStoreId} />
                  </Grid>
                  <Grid xs={12} md={7} lg={7}>
                    {storeId ? (
                      <CompanyHistoryTable id={storeId} />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        请先在左侧选择一个店铺。
                      </Typography>
                    )}
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

StoreHistory.getLayout = (page: JSX.Element) => <DashboardLayout>{page}</DashboardLayout>;

export default StoreHistory;
