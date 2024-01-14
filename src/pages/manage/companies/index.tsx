import React, { useEffect } from "react";
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
} from "@mui/material";
import { CompanyCard } from "src/sections/companies/company-card";
import { CompaniesSearch } from "src/sections/companies/companies-search";
import { post } from "src/lib/http";
import { toast } from "react-toastify";
import { StoreType } from "src/types/store.type";
import { Layout as DashboardLayout } from "../../../layouts/dashboard/layout";

function Page() {
  const pageSize = 6;
  const [pages, setPages] = React.useState(0);
  const [page, setPage] = React.useState<number>(0);
  const [companies, setCompanies] = React.useState<StoreType[]>([]);

  useEffect(() => {
    post<{ pages: number; data: StoreType[] }>({
      url: "/api/store/pagination",
      payload: { pageNum: page, pageSize, filtered: [], sorted: [] },
    })
      .then((res) => {
        setPages(res.pages);
        setCompanies(res.data);
      })
      .catch((err) => toast.error(err.message));
  }, [page]);

  return (
    <>
      <Head>
        <title>Companies | Devias Kit</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Stack spacing={1}>
                <Typography variant="h4">Companies</Typography>
                <Stack alignItems="center" direction="row" spacing={1}>
                  <Button
                    color="inherit"
                    startIcon={
                      <SvgIcon fontSize="small">
                        <ArrowUpOnSquareIcon />
                      </SvgIcon>
                    }
                  >
                    Import
                  </Button>
                  <Button
                    color="inherit"
                    startIcon={
                      <SvgIcon fontSize="small">
                        <ArrowDownOnSquareIcon />
                      </SvgIcon>
                    }
                  >
                    Export
                  </Button>
                </Stack>
              </Stack>
              <div>
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
              </div>
            </Stack>
            <CompaniesSearch />
            <Grid container spacing={3}>
              {companies.map((company) => (
                <Grid xs={12} md={6} lg={4} key={company.store_id}>
                  <CompanyCard company={company} />
                </Grid>
              ))}
            </Grid>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Pagination count={pages} size="small" onChange={(e, p) => setPage(p - 1)} />
            </Box>
          </Stack>
        </Container>
      </Box>
    </>
  );
}

Page.getLayout = (page: JSX.Element) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
