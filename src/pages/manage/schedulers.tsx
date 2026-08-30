import React, { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import {
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { get } from "src/lib/http";

type ScheduleRow = {
  name: string;
  title: string;
  description: string;
  cron: string;
  running: boolean;
  lastDate: string | null;
  nextDate: string | null;
};

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-CN");
}

function SchedulersPage() {
  const [items, setItems] = useState<ScheduleRow[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const data = await get<ScheduleRow[]>("/api/schedules");
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error((err as { message?: string })?.message || "加载调度任务失败");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  return (
    <>
      <Head>
        <title>调度任务</title>
      </Head>
      <Box component="main" sx={{ flexGrow: 1, py: 2 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h4">调度任务</Typography>
              <Button variant="outlined" onClick={fetchList} disabled={loading}>
                {loading ? "刷新中…" : "刷新"}
              </Button>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              当前 open-api 进程内已注册的 Cron（来自 SchedulerRegistry）
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>名称</TableCell>
                    <TableCell>Cron</TableCell>
                    <TableCell>状态</TableCell>
                    <TableCell>上次执行</TableCell>
                    <TableCell>下次执行</TableCell>
                    <TableCell>说明</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((row) => (
                    <TableRow key={row.name} hover>
                      <TableCell>
                        <Stack spacing={0.25}>
                          <Typography variant="subtitle2">{row.title || row.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {row.name}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                          {row.cron}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={row.running ? "运行中" : "空闲"}
                          color={row.running ? "warning" : "success"}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{formatDateTime(row.lastDate)}</TableCell>
                      <TableCell>{formatDateTime(row.nextDate)}</TableCell>
                      <TableCell>{row.description || "-"}</TableCell>
                    </TableRow>
                  ))}
                  {!loading && items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        暂无调度任务
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </Container>
      </Box>
    </>
  );
}

SchedulersPage.getLayout = (page: JSX.Element) => <DashboardLayout>{page}</DashboardLayout>;

export default SchedulersPage;
