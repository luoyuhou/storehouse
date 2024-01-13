import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import React, { useEffect, useState } from "react";
import Head from "next/head";
import {
  Box,
  Container,
  Stack,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  IconButton,
  Collapse,
  TableFooter,
  TablePagination,
} from "@mui/material";

import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import { useTheme } from "@mui/material/styles";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@material-ui/icons";
import LastPageIcon from "@material-ui/icons/LastPage";
import FirstPageIcon from "@material-ui/icons/FirstPage";
import { Theme } from "@mui/material/styles/createTheme";
import { get, post } from "src/lib/http";
import { toast } from "react-toastify";
import CircularPercentageLoading from "src/components/loading/circular-percentage.loading";
import { StoreType, StoryHistoryType } from "src/types/store.type";
import dayjs from "dayjs";
// ReturnType<typeof createData>

function Row(props: { row: StoreType }) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);
  const [history, setHistory] = useState<StoryHistoryType[]>([]);

  useEffect(() => {
    if (!open) {
      return;
    }

    get<StoryHistoryType[]>(`/api/store/history/${row.store_id}`)
      .then((res) => setHistory(res))
      .catch((err) => toast.error(err.message));
  }, [open]);

  return (
    <>
      <TableRow>
        <TableCell sx={{ maxWidth: "30px" }}>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.store_name}
        </TableCell>
        <TableCell>{row.province}</TableCell>
        <TableCell>{row.city}</TableCell>
        <TableCell>{row.area}</TableCell>
        <TableCell align="right">{row.town}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Typography variant="h6" gutterBottom component="div">
                历史记录
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>申请时间</TableCell>
                    <TableCell>操作类型</TableCell>
                    <TableCell align="right">操作内容</TableCell>
                    <TableCell align="right">回复时间</TableCell>
                    <TableCell align="right">回复内容</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map((historyRow) => (
                    <TableRow key={historyRow.id}>
                      <TableCell component="th" scope="row">
                        {historyRow.applicant_date
                          ? dayjs(historyRow.applicant_date).format("YYYY-MM-DD HH:mm:ss")
                          : ""}
                      </TableCell>
                      <TableCell>{historyRow.action_type}</TableCell>
                      <TableCell align="right">{historyRow.action_content}</TableCell>
                      <TableCell align="right">{historyRow.replient_date}</TableCell>
                      <TableCell align="right">{historyRow.replient_content}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: React.MouseEvent<HTMLButtonElement>, newPage: number) => void;
}

function TablePaginationActions(props: TablePaginationActionsProps) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, Math.max(0, Math.floor(count / rowsPerPage)));
  };

  return (
    <Container
      sx={{ flexShrink: 0, marginLeft: theme.spacing(2.5), minWidth: "208px", maxWidth: "208px" }}
    >
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page">
        {theme.direction === "rtl" ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === "rtl" ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === "rtl" ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Container>
  );
}

function StoreList() {
  const pageSize = 5;
  const [rows, setRows] = useState<number>(0);
  const [page, setPage] = React.useState(0);
  const [data, setData] = useState<StoreType[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  useEffect(() => {
    setLoading(true);
    post<{ data: StoreType[]; rows: number; pages: number }>({
      url: "/api/store/apply-list",
      payload: {
        pageNum: page,
        pageSize,
        filtered: [{ id: "status", value: 0 }],
        sorted: [{ id: "create_date", desc: true }],
      },
    })
      .then(({ data: list, rows: count }) => {
        setData(list);
        setRows(count);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <>
      <Head>
        <title>商店申请记录</title>
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
            <Container>
              <Typography variant="h4">商店申请记录</Typography>
            </Container>
            <CircularPercentageLoading loading={loading}>
              <TableContainer component={Paper}>
                <Table aria-label="collapsible table">
                  <TableHead>
                    <TableRow>
                      <TableCell />
                      <TableCell>商点名</TableCell>
                      <TableCell>省/直辖市</TableCell>
                      <TableCell>市</TableCell>
                      <TableCell>区</TableCell>
                      <TableCell align="right">城镇地区</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.map((row) => (
                      <Row key={row.store_name} row={row} />
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TablePagination
                        style={{ overflow: "inherit" }}
                        rowsPerPageOptions={[pageSize]}
                        colSpan={3}
                        count={rows}
                        rowsPerPage={pageSize}
                        page={page}
                        SelectProps={{
                          inputProps: { "aria-label": "rows per page" },
                          native: true,
                        }}
                        onPageChange={handleChangePage}
                        // onRowsPerPageChange={handleChangeRowsPerPage}
                        ActionsComponent={TablePaginationActions}
                      />
                    </TableRow>
                  </TableFooter>
                </Table>
              </TableContainer>
            </CircularPercentageLoading>
          </Stack>
        </Container>
      </Box>
    </>
  );
}

StoreList.getLayout = (page: JSX.Element) => <DashboardLayout>{page}</DashboardLayout>;

export default StoreList;
