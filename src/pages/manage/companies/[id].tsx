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

interface StoreServicePlanSummary {
  id: number;
  plan_id: string;
  name: string;
  monthly_fee: number;
}

interface StoreServiceSubscriptionSummary {
  id: number;
  store_id: string;
  plan_id: string;
  start_date: string;
  end_date: string;
  status: number;
  plan?: StoreServicePlanSummary;
}

interface StoreServiceInvoiceSummary {
  id: number;
  subscription_id: number;
  month: string;
  amount: number;
  status: number;
  due_date: string;
  paid_at?: string | null;
  subscription: StoreServiceSubscriptionSummary;
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getStatusName(value: number) {
  if (value === 0) return "待支付";
  if (value === 1) return "已支付";
  return value === 2 ? "逾期" : "已取消";
}

function CompanyDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [company, setCompany] = React.useState<StoreType>();
  const [companyLoading, setCompanyLoading] = React.useState<boolean>(false);

  const [value, setValue] = React.useState(0);

  const [serviceSubscriptions, setServiceSubscriptions] = React.useState<
    StoreServiceSubscriptionSummary[]
  >([]);
  const [serviceInvoices, setServiceInvoices] = React.useState<StoreServiceInvoiceSummary[]>([]);
  const [serviceLoading, setServiceLoading] = React.useState(false);

  useEffect(() => {
    if (!id) return;
    setCompanyLoading(true);
    get<StoreType>(`/api/store/${id}`)
      .then((res) => {
        setCompany(res);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setCompanyLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setServiceLoading(true);
    Promise.all([
      get<{ data: StoreServiceSubscriptionSummary[] }>(
        `/api/store/service/subscriptions?store_id=${id}`,
      ),
      get<{ data: StoreServiceInvoiceSummary[] }>(`/api/store/service/invoices?store_id=${id}`),
    ])
      .then(([subsRes, invRes]) => {
        setServiceSubscriptions(subsRes.data || []);
        setServiceInvoices(invRes.data || []);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setServiceLoading(false));
  }, [id]);

  const activeSubscription = React.useMemo(() => {
    if (!serviceSubscriptions.length) return undefined;
    const active = serviceSubscriptions.find((s) => s.status === 1);
    return active || serviceSubscriptions[0];
  }, [serviceSubscriptions]);

  const latestInvoice = React.useMemo(() => {
    if (!serviceInvoices.length) return undefined;
    return serviceInvoices[0];
  }, [serviceInvoices]);

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

                  <Box mt={3}>
                    <Typography variant="h6" gutterBottom>
                      店铺服务
                    </Typography>
                    {/* eslint-disable-next-line no-nested-ternary */}
                    {serviceLoading ? (
                      <Typography variant="body2">服务信息加载中...</Typography>
                    ) : !activeSubscription ? (
                      <Typography variant="body2">暂无服务订阅</Typography>
                    ) : (
                      <>
                        <Typography variant="body2">
                          当前订阅：
                          {activeSubscription.plan?.name || "未知套餐"}（
                          {formatDate(activeSubscription.start_date)} ~{" "}
                          {formatDate(activeSubscription.end_date)}）
                        </Typography>
                        {latestInvoice && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            最近账单：{latestInvoice.month}，金额 {latestInvoice.amount} 元，状态{" "}
                            {getStatusName(latestInvoice.status)}
                            ，到期日 {formatDate(latestInvoice.due_date)}
                            {latestInvoice.paid_at &&
                              `，支付时间 ${formatDate(latestInvoice.paid_at)}`}
                          </Typography>
                        )}
                      </>
                    )}
                  </Box>
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
