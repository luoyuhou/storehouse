import React, { useEffect } from "react";
import CircularPercentageLoading from "src/components/loading/circular-percentage.loading";
import {
  Box,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { StoryHistoryType } from "src/types/store.type";
import dayjs from "dayjs";
import { get } from "src/lib/http";
import { toast } from "react-toastify";

function Row(props: { row: StoryHistoryType }) {
  const { row } = props;

  return (
    <TableRow>
      <TableCell component="th" scope="row">
        {row.store_id}
      </TableCell>
      <TableCell>{row.action_type}</TableCell>
      <TableCell>{row.action_content}</TableCell>
      <TableCell width="120px">
        {row.action_date ? dayjs(row.action_date).format("YYYY-MM-DD HH:mm:ss") : ""}
      </TableCell>
      <TableCell>{row.payload ?? "N/A"}</TableCell>
    </TableRow>
  );
}

export function CompanyHistoryTable({ id }: { id: string }) {
  const pageSize = 2;
  const [loading, setLoading] = React.useState<boolean>(false);
  const [page, setPage] = React.useState<number>(0);
  const [rows, setRows] = React.useState<number>(0);
  const [data, setData] = React.useState<StoryHistoryType[]>([]);

  useEffect(() => {
    setLoading(true);
    get<StoryHistoryType[]>(`/api/store/history/${id}`)
      .then((res) => {
        setRows(res.length);
        setData(res);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <CircularPercentageLoading loading={loading}>
      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell>Store ID</TableCell>
              <TableCell>类型</TableCell>
              <TableCell>申请内容</TableCell>
              <TableCell>申请时间</TableCell>
              <TableCell>备注</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.slice(page * pageSize, (page + 1) * pageSize).map((row) => (
              <Row key={row.id} row={row} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Pagination
          count={Math.ceil(rows / pageSize)}
          size="small"
          onChange={(e, p) => setPage(p - 1)}
        />
      </Box>
    </CircularPercentageLoading>
  );
}
