import React, { useEffect, useState } from "react";
import Head from "next/head";
import {
  Box,
  Container,
  Pagination,
  Stack,
  Typography,
  Unstable_Grid2 as Grid,
  Tabs,
  Tab,
} from "@mui/material";
import { CompanyCard } from "src/sections/companies/company-card";
import { CompaniesSearch } from "src/sections/companies/companies-search";
import { post } from "src/lib/http";
import { toast } from "react-toastify";
import { StoreType } from "src/types/store.type";
import { StoreServiceSubscriptionsSection } from "src/sections/store-service/store-service-subscriptions-section";
import { StoreResourceOrder } from "src/sections/store/store-resource/store-resource-order";
import { Layout as DashboardLayout } from "../../../layouts/dashboard/layout";

function Page() {
  const [tab, setTab] = useState(0);

  // Tab 0: 商铺列表
  const pageSize = 6;
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState<number>(0);
  const [companies, setCompanies] = useState<StoreType[]>([]);

  // Tab 1 & 2: 审批列表

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

  useEffect(() => {
    if (tab === 0) fetchCompanies();
  }, [tab]);

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
            {tab === 1 && <StoreServiceSubscriptionsSection />}

            {tab === 2 && <StoreResourceOrder />}
          </Stack>
        </Container>
      </Box>
    </>
  );
}

Page.getLayout = (page: JSX.Element) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
