import React, { useCallback, useEffect, useMemo, useState } from "react";
import Head from "next/head";
import ArrowDownOnSquareIcon from "@heroicons/react/24/solid/ArrowDownOnSquareIcon";
import ArrowUpOnSquareIcon from "@heroicons/react/24/solid/ArrowUpOnSquareIcon";
import { Box, Button, Container, Stack, SvgIcon, Typography } from "@mui/material";
import { CustomersTable } from "src/sections/customer/customers-table";
import { CustomersSearch } from "src/sections/customer/customers-search";
import { RetentionRateChart } from "src/sections/customer/retention-rate-chart";
import { OnlineCountChart, OnlineCountPoint } from "src/sections/customer/online-count-chart";
import { useSelection } from "src/hooks/use-selection";
import { get, post } from "src/lib/http";
import { toast } from "react-toastify";
import { UserEntity } from "src/types/users";
import CustomerTabs from "src/components/tabs/customer-tabs";
import KickOffline from "src/sections/online-users/kick-offline";
import { Layout as DashboardLayout } from "../../layouts/dashboard/layout";

const useCustomerIds = (customers: UserEntity[]) => {
  return useMemo(() => {
    return customers.map(({ id }) => id);
  }, [customers]);
};

function Page() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [rows, setRows] = useState<number>(0);
  const [customers, setCustomers] = useState<UserEntity[]>([]);
  const customersIds = useCustomerIds(customers);
  const customersSelection = useSelection(customersIds);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [retentionData, setRetentionData] = useState<
    { date: string; day1: number; day3: number; day7: number; newUsers: number }[]
  >([]);
  const [retentionLoading, setRetentionLoading] = useState(false);
  const [onlineSeries, setOnlineSeries] = useState<OnlineCountPoint[]>([]);
  const [onlineCurrent, setOnlineCurrent] = useState(0);
  const [onlineLoading, setOnlineLoading] = useState(false);

  const handleSearchChange = useCallback((v: string) => {
    setPage(0);
    setSearch(v);
  }, []);

  useEffect(() => {
    setRetentionLoading(true);
    get<{ date: string; day1: number; day3: number; day7: number; newUsers: number }[]>(
      "/api/users/stats/retention-rate",
    )
      .then((data) => {
        if (Array.isArray(data)) {
          setRetentionData(data);
        } else {
          console.error("Retention data is not an array:", data);
          setRetentionData([]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch retention rate:", err);
      })
      .finally(() => {
        setRetentionLoading(false);
      });
  }, []);

  useEffect(() => {
    setOnlineLoading(true);
    get<{ current: number; series: OnlineCountPoint[] }>("/api/users/stats/online-count")
      .then((data) => {
        setOnlineCurrent(typeof data?.current === "number" ? data.current : 0);
        setOnlineSeries(Array.isArray(data?.series) ? data.series : []);
      })
      .catch((err) => {
        console.error("Failed to fetch online count:", err);
        setOnlineSeries([]);
      })
      .finally(() => {
        setOnlineLoading(false);
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    post<{ data: { data: UserEntity[]; rows: number; pages: number } }>({
      url: "/api/users/pagination",
      payload: {
        pageNum: page,
        pageSize: rowsPerPage,
        filtered: search ? [{ id: "phone", value: search }] : [],
        sorted: [],
      },
    })
      .then(({ data: usersData }) => {
        setCustomers(usersData.data);
        setRows(usersData.rows);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [page, search, rowsPerPage]);

  const handlePageChange = useCallback(
    (_event: React.MouseEvent<HTMLButtonElement> | null, value: number) => {
      setPage(value);
    },
    [],
  );

  const handleRowsPerPageChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      setRowsPerPage(Number(event.target.value));
      setPage(0);
    },
    [],
  );

  const statsTabs = useMemo(
    () => [
      {
        key: "retention",
        label: "用户留存率",
        isDefault: true,
        children: <RetentionRateChart data={retentionData} loading={retentionLoading} />,
      },
      {
        key: "online-count",
        label: "在线人数",
        children: (
          <OnlineCountChart data={onlineSeries} current={onlineCurrent} loading={onlineLoading} />
        ),
      },
    ],
    [retentionData, retentionLoading, onlineSeries, onlineCurrent, onlineLoading],
  );

  return (
    <>
      <Head>
        <title>Customers</title>
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
            <Typography variant="h4">Customers</Typography>
            <CustomerTabs tabs={statsTabs} />

            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <CustomersSearch onChange={handleSearchChange} />
              <Stack alignItems="center" direction="row" justifyContent="center" spacing={1}>
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
            <CustomerTabs
              tabs={[
                {
                  key: "user-list",
                  label: "用户列表",
                  isDefault: true,
                  children: (
                    <CustomersTable
                      count={rows}
                      items={customers}
                      onDeselectAll={customersSelection.handleDeselectAll}
                      onDeselectOne={customersSelection.handleDeselectOne}
                      onPageChange={handlePageChange}
                      onRowsPerPageChange={handleRowsPerPageChange}
                      onSelectAll={customersSelection.handleSelectAll}
                      onSelectOne={customersSelection.handleSelectOne}
                      page={page}
                      rowsPerPage={rowsPerPage}
                      selected={customersSelection.selected}
                      loading={loading}
                    />
                  ),
                },
                {
                  key: "kick-off",
                  label: "踢人下线",
                  children: <KickOffline />,
                },
              ]}
            />
          </Stack>
        </Container>
      </Box>
    </>
  );
}

Page.getLayout = (page: JSX.Element) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
