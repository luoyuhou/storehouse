import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import {
  Box,
  Chip,
  Collapse,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import { TablePaginationActions } from "src/components/table";
import { GoodsType, GoodsVersionType } from "src/types/goods.type";
import { toast } from "react-toastify";
import { get, post } from "src/lib/http";
import { StoreType } from "src/types/store.type";
import dayjs from "dayjs";
import CircularPercentageLoading from "src/components/loading/circular-percentage.loading";

function Row(props: { row: GoodsType & { versions?: number } }) {
  const { row } = props;
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [versionInfos, setVersionInfos] = React.useState<GoodsVersionType[]>([]);

  useEffect(() => {
    if (!open) {
      return;
    }
    setLoading(true);
    get<{ data: GoodsVersionType[] }>(`/api/store/goods/version/${row.goods_id}`)
      .then(({ data }) => setVersionInfos(data))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [open]);

  return (
    <>
      <TableRow
        sx={{
          "& > *": {
            borderBottom: "unset",
          },
        }}
      >
        <TableCell sx={{ maxWidth: "30px" }}>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.store_name ?? row.store_id}
        </TableCell>
        <TableCell align="right">{row.category_name ?? row.category_id}</TableCell>
        <TableCell align="right">
          <a href={`/store/goods-detail?id=${row.goods_id}`} target="_blank" rel="noreferrer">
            {row.name}
          </a>
        </TableCell>
        <TableCell align="right">{row.status}</TableCell>
        <TableCell align="right">{row.versions ?? "N/A"}</TableCell>
        <TableCell align="right">{dayjs(row.create_date).format("YYYY-mm-DD HH:mm:ss")}</TableCell>
        <TableCell align="right">{dayjs(row.update_date).format("YYYY-mm-DD HH:mm:ss")}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Typography variant="h6" gutterBottom component="div">
                商铺版本
              </Typography>
              <Table size="medium" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>单位</TableCell>
                    <TableCell>价格/元</TableCell>
                    <TableCell align="right">数量</TableCell>
                    <TableCell align="right">状态</TableCell>
                    <TableCell align="right">生成批次</TableCell>
                    <TableCell align="right">条形码</TableCell>
                    <TableCell align="right">供应商</TableCell>
                    <TableCell align="right">更新时间</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <CircularPercentageLoading loading={loading}>
                    {versionInfos.map((v) => (
                      <TableRow key={v.version_id}>
                        <TableCell component="th" scope="row">
                          {v.unit_name}
                        </TableCell>
                        <TableCell>{(v.price / 100).toFixed(2)}</TableCell>
                        <TableCell align="right">{v.count}</TableCell>
                        <TableCell align="right">{v.status}</TableCell>
                        <TableCell align="right">
                          {v.version_number ? (
                            <Chip color="primary" label={v.version_number} />
                          ) : null}
                        </TableCell>
                        <TableCell align="right">
                          {v.bar_code ? <Chip label={v.bar_code} /> : null}
                        </TableCell>
                        <TableCell align="right">{v.supplier}</TableCell>
                        <TableCell align="right">
                          {dayjs(v.create_date).format("YYYY-mm-DD HH:mm")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </CircularPercentageLoading>
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function GoodsList() {
  const [storeLoading, setStoreLoading] = React.useState(false);
  const [stores, setStores] = React.useState<StoreType[]>([]);
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(5);
  const [rows, setRows] = React.useState(0);
  const [data, setData] = React.useState<GoodsType[]>([]);
  const [filtered, setFiltered] = React.useState<{ id: string; value: unknown }[]>([]);

  useEffect(() => {
    setStoreLoading(true);
    get<{ data: StoreType[] }>("/api/store")
      .then((res) => setStores(res.data))
      .catch((err) => toast.error(err.message))
      .finally(() => setStoreLoading(false));
  }, []);

  useEffect(() => {
    setFiltered([{ id: "store_id", value: stores.map(({ store_id }) => store_id) }]);
  }, [stores]);

  useEffect(() => {
    post<{ pages: number; rows: number; data: GoodsType[] }>({
      url: "/api/store/goods/pagination",
      payload: { pageNum: page, pageSize, filtered, sorted: [] },
    })
      .then((res) => {
        setRows(res.rows);
        setData(res.data);
      })
      .catch((err) => toast.error(JSON.stringify(err.message)));
  }, [page, pageSize, filtered]);

  return (
    <TableContainer component={Paper}>
      <Table stickyHeader aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>商铺</TableCell>
            <TableCell align="right">分类</TableCell>
            <TableCell align="right">商品名</TableCell>
            <TableCell align="right">状态</TableCell>
            <TableCell align="right">版本数量</TableCell>
            <TableCell align="right">创建时间</TableCell>
            <TableCell align="right">更新时间</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <Row key={row.name} row={row} />
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
              onPageChange={(e, p) => setPage(p)}
              // onRowsPerPageChange={handleChangeRowsPerPage}
              ActionsComponent={TablePaginationActions}
            />
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
}
