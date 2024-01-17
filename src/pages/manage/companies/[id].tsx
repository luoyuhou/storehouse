import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import React, { useEffect } from "react";
import Head from "next/head";
import {
  Box,
  Container,
  Stack,
  Typography,
  Unstable_Grid2 as Grid,
  AppBar,
  Tabs,
  Tab,
} from "@mui/material";
import { useRouter } from "next/router";
import { CompanyProfile } from "src/sections/companies/company-profile";
import { CompanyProfileDetails } from "src/sections/companies/company-profile-details";
import { StoreType } from "src/types/store.type";
import { get } from "src/lib/http";
import { toast } from "react-toastify";
import CircularPercentageLoading from "src/components/loading/circular-percentage.loading";
import { CompanyHistoryTable } from "src/sections/companies/company-history-table";
import { CompanyApprover, CompanyRejecter } from "src/sections/companies/company-stepper";

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
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `scrollable-auto-tab-${index}`,
    "aria-controls": `scrollable-auto-tabpanel-${index}`,
  };
}

function CompanyDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [company, setCompany] = React.useState<StoreType>();
  const [companyLoading, setCompanyLoading] = React.useState<boolean>(false);

  const [value, setValue] = React.useState(0);

  useEffect(() => {
    setCompanyLoading(true);
    get<StoreType>(`/api/store/${id}`)
      .then((res) => {
        setCompany(res);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setCompanyLoading(false));
  }, []);
  return (
    <>
      <Head>
        <title>Company Detail</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 0,
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={3}>
            <div>
              <Typography variant="h4">商铺详情</Typography>
            </div>
            <div>
              <Grid container spacing={3}>
                <CircularPercentageLoading loading={companyLoading}>
                  <Grid xs={12} md={6} lg={4}>
                    {company && <CompanyProfile company={company} />}
                  </Grid>
                  <Grid xs={12} md={6} lg={8}>
                    {company && <CompanyProfileDetails company={company} />}
                  </Grid>
                </CircularPercentageLoading>
              </Grid>
            </div>

            <div
              style={{
                flexGrow: 1,
                width: "100%",
                // backgroundColor: Theme.palette.background.paper,
              }}
            >
              <AppBar position="static" color="default">
                <Tabs
                  value={value}
                  onChange={(e, v) => setValue(v)}
                  indicatorColor="primary"
                  textColor="primary"
                  variant="scrollable"
                  scrollButtons="auto"
                  aria-label="scrollable auto tabs example"
                >
                  <Tab
                    sx={{ margin: "0 0.5rem", padding: "0 0.5rem" }}
                    label="商铺审核"
                    {...a11yProps(0)}
                  />
                  <Tab
                    sx={{ margin: "0 0.5rem", padding: "0 0.5rem" }}
                    label="商铺管理"
                    {...a11yProps(1)}
                  />
                  <Tab
                    sx={{ margin: "0 0.5rem", padding: "0 0.5rem" }}
                    label="历史记录"
                    {...a11yProps(2)}
                  />
                </Tabs>
              </AppBar>
              <TabPanel value={value} index={0}>
                <Box>
                  <Grid>
                    <Grid>{id && <CompanyApprover id={id as string} />}</Grid>
                  </Grid>
                </Box>
              </TabPanel>
              <TabPanel value={value} index={1}>
                <Box>
                  <Grid>
                    <Grid>{id && <CompanyRejecter id={id as string} />}</Grid>
                  </Grid>
                </Box>
              </TabPanel>
              <TabPanel value={value} index={2}>
                <Box sx={{ marginTop: "5px" }}>
                  <Grid container spacing={3}>
                    <Grid xs={12} md={12} lg={12}>
                      {id && <CompanyHistoryTable id={id as string} />}
                    </Grid>
                  </Grid>
                </Box>
              </TabPanel>
            </div>
          </Stack>
        </Container>
      </Box>
    </>
  );
}

CompanyDetail.getLayout = (page: JSX.Element) => <DashboardLayout>{page}</DashboardLayout>;

export default CompanyDetail;
