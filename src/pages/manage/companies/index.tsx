import React, { useEffect, useState } from "react";
import Head from "next/head";
import ArrowUpOnSquareIcon from "@heroicons/react/24/solid/ArrowUpOnSquareIcon";
import ArrowDownOnSquareIcon from "@heroicons/react/24/solid/ArrowDownOnSquareIcon";
import PlusIcon from "@heroicons/react/24/solid/PlusIcon";
import {
  Box,
  Button,
  Container,
  Pagination,
  Stack,
  SvgIcon,
  Typography,
  Unstable_Grid2 as Grid,
  Tabs,
  Tab,
  Card,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { CompanyCard } from "src/sections/companies/company-card";
import { CompaniesSearch } from "src/sections/companies/companies-search";
import { get, post } from "src/lib/http";
import { toast } from "react-toastify";
import { StoreType } from "src/types/store.type";
import { Layout as DashboardLayout } from "../../../layouts/dashboard/layout";

interface QuotaOrder {
  id: number;
  order_id: string;
  store_id: string;
  quota_amount: string;
  price: number;
  status: number;
  create_date: string;
}

interface SubscriptionOrder {
  id: number;
  store_id: string;
  plan: {
    name: string;
    monthly_fee: number;
  };
  start_date: string;
  end_date: string;
  status: number;
  create_date: string;
}

function Page() {
  const [tab, setTab] = useState(0);

  // Tab 0: 商铺列表
  const pageSize = 6;
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState<number>(0);
  const [companies, setCompanies] = useState<StoreType[]>([]);

  // Tab 1 & 2: 审批列表
  const [quotaOrders, setQuotaOrders] = useState<QuotaOrder[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionOrder[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCompanies = () => {
    post<{ pages: number; data: StoreType[] }>({
      url: "/api/store/pagination",
      payload: { pageNum: page, pageSize, filtered: [], sorted: [] },
    })
      .then((res) => {
        setPages(res.pages);
        setCompanies(res.data);
      })
      .catch((err) => toast.error(err.message));
  };

  const fetchQuotaOrders = async () => {
    try {
      const res = await get<{ data: QuotaOrder[] }>("/api/store-resource/pending-orders");
      setQuotaOrders(res.data);
    } catch (err) {
      toast.error((err as { message: string }).message);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const res = await get<{ data: SubscriptionOrder[] }>(
        "/api/store-service/pending-subscriptions",
      );
      setSubscriptions(res.data);
    } catch (err) {
      toast.error((err as { message: string }).message);
    }
  };

  useEffect(() => {
    if (tab === 0) fetchCompanies();
    else if (tab === 1) fetchSubscriptions();
    else if (tab === 2) fetchQuotaOrders();
  }, [tab, page]);

  const handleApproveQuota = async (id: number) => {
    try {
      setLoading(true);
      await post({ url: `/api/store-resource/approve-order/${id}`, payload: {} });
      toast.success("额度申请已通过");
      fetchQuotaOrders();
    } catch (err) {
      toast.error((err as { message: string }).message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSubscription = async (id: number) => {
    try {
      setLoading(true);
      await post({ url: `/api/store-service/subscriptions/${id}/approve`, payload: {} });
      toast.success("订阅申请已通过");
      fetchSubscriptions();
    } catch (err) {
      toast.error((err as { message: string }).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>商户管理 | 管理后台</title>
      </Head>
      <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Typography variant="h4">商户管理</Typography>
              {tab === 0 && (
                <Button
                  startIcon={
                    <SvgIcon fontSize="small">
                      <PlusIcon />
                    </SvgIcon>
                  }
                  variant="contained"
                >
                  Add
                </Button>
              )}
            </Stack>

            <Tabs
              value={tab}
              onChange={(e, v) => setTab(v)}
              sx={{ borderBottom: 1, borderColor: "divider" }}
            >
              <Tab label="商铺列表" />
              <Tab label="订阅服务申请" />
              <Tab label="图片资源申请" />
            </Tabs>

            {tab === 0 && (
              <>
                <CompaniesSearch />
                <Grid container spacing={3}>
                  {companies.map((company) => (
                    <Grid xs={12} md={6} lg={4} key={company.store_id}>
                      <CompanyCard company={company} />
                    </Grid>
                  ))}
                </Grid>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <Pagination count={pages} size="small" onChange={(e, p) => setPage(p - 1)} />
                </Box>
              </>
            )}

            {(tab === 1 || tab === 2) && (
              <Card>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>商店ID</TableCell>
                      {tab === 2 ? (
                        <>
                          <TableCell>申请额度 (MB)</TableCell>
                          <TableCell>金额 (元)</TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell>订阅套餐</TableCell>
                          <TableCell>开始日期</TableCell>
                        </>
                      )}
                      <TableCell>申请时间</TableCell>
                      <TableCell align="right">操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tab === 2
                      ? quotaOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>{order.store_id}</TableCell>
                            <TableCell>{Number(order.quota_amount) / (1024 * 1024)} MB</TableCell>
                            <TableCell>{order.price}</TableCell>
                            <TableCell>{new Date(order.create_date).toLocaleString()}</TableCell>
                            <TableCell align="right">
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleApproveQuota(order.id)}
                                disabled={loading}
                              >
                                通过
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      : subscriptions.map((sub) => (
                          <TableRow key={sub.id}>
                            <TableCell>{sub.store_id}</TableCell>
                            <TableCell>{sub.plan?.name}</TableCell>
                            <TableCell>{new Date(sub.start_date).toLocaleDateString()}</TableCell>
                            <TableCell>{new Date(sub.create_date).toLocaleString()}</TableCell>
                            <TableCell align="right">
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleApproveSubscription(sub.id)}
                                disabled={loading}
                              >
                                通过
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                  </TableBody>
                </Table>
                {((tab === 2 && quotaOrders.length === 0) ||
                  (tab === 1 && subscriptions.length === 0)) && (
                  <Box sx={{ p: 3, textAlign: "center" }}>
                    <Typography color="textSecondary">暂无待处理申请</Typography>
                  </Box>
                )}
              </Card>
            )}
          </Stack>
        </Container>
      </Box>
    </>
  );
}

Page.getLayout = (page: JSX.Element) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
