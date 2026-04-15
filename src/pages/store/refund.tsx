import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  AppBar,
} from "@mui/material";
import { get, post } from "src/lib/http";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { StoreType } from "src/types/store.type";
import CircularPercentageLoading from "src/components/loading/circular-percentage.loading";

type RefundItem = {
  refund_id: string;
  order_id: string;
  user_id: string;
  store_id: string;
  money: number;
  reason: string;
  remark?: string;
  images?: string;
  status: number;
  reject_reason?: string;
  handled_at?: string;
  handled_by?: string;
  create_date: string;
};

type StatusStats = {
  pending: number;
  completed: number;
  rejected: number;
  cancelled: number;
};

const statusConfig: Record<
  number,
  { text: string; color: "warning" | "success" | "error" | "default" }
> = {
  0: { text: "待处理", color: "warning" },
  1: { text: "已退款", color: "success" },
  2: { text: "已拒绝", color: "error" },
  [-1]: { text: "已取消", color: "default" },
};

function RefundPage() {
  // const { currentStore } = useStore();
  const [loading, setLoading] = useState(false);
  const [refundList, setRefundList] = useState<RefundItem[]>([]);
  const [statusStats, setStatusStats] = useState<StatusStats>({
    pending: 0,
    completed: 0,
    rejected: 0,
    cancelled: 0,
  });
  const [stores, setStores] = useState<StoreType[]>([]);
  const [activeStoreId, setActiveStoreId] = useState<string>("");

  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(10);
  const [currentTab, setCurrentTab] = useState<number | null>(null);

  useEffect(() => {
    get<{ data: StoreType[] }>("/api/store")
      .then((res) => {
        setStores(res.data);
        if (res.data.length > 0) {
          setActiveStoreId(res.data[0].store_id);
        }
      })
      .catch((err) => toast.error(err.message));
  }, []);

  const handleStoreChange = (_event: React.SyntheticEvent, newValue: string) => {
    setActiveStoreId(newValue);
  };

  // 处理弹窗
  const [handleDialog, setHandleDialog] = useState<{
    open: boolean;
    refund: RefundItem | null;
    action: "approve" | "reject" | null;
    rejectReason: string;
  }>({
    open: false,
    refund: null,
    action: null,
    rejectReason: "",
  });

  const loadRefunds = async () => {
    if (!activeStoreId) return;

    setLoading(true);
    try {
      const res = await post<{
        message: string;
        data: {
          list: RefundItem[];
          total: number;
          statusStats: StatusStats;
        };
      }>({
        url: `/api/store/refund/store/${activeStoreId}`,
        payload: {
          pageNum: page,
          pageSize,
          status: currentTab,
        },
      });

      setRefundList(res.data.list || []);
      setTotal(res.data.total);
      setStatusStats(res.data.statusStats);
    } catch (err) {
      toast.error((err as { message: string }).message || "加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRefunds();
  }, [activeStoreId, page, currentTab]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number | null) => {
    setCurrentTab(newValue);
    setPage(0);
  };

  const openHandleDialog = (refund: RefundItem, action: "approve" | "reject") => {
    setHandleDialog({
      open: true,
      refund,
      action,
      rejectReason: "",
    });
  };

  const closeHandleDialog = () => {
    setHandleDialog({
      open: false,
      refund: null,
      action: null,
      rejectReason: "",
    });
  };

  const submitHandle = async () => {
    if (!handleDialog.refund || !handleDialog.action) return;

    if (handleDialog.action === "reject" && !handleDialog.rejectReason) {
      toast.error("请填写拒绝原因");
      return;
    }

    try {
      await post({
        url: `/api/store/refund/${handleDialog.refund.refund_id}/handle`,
        payload: {
          action: handleDialog.action,
          rejectReason: handleDialog.rejectReason,
        },
      });

      toast.success(handleDialog.action === "approve" ? "已同意退款" : "已拒绝退款");
      closeHandleDialog();
      loadRefunds();
    } catch (err) {
      toast.error((err as { message: string }).message || "操作失败");
    }
  };

  return (
    <>
      <Head>
        <title>退款管理</title>
      </Head>
      <Box component="main" sx={{ flexGrow: 1, py: 2 }}>
        <Container style={{ maxWidth: "1400px" }}>
          <Stack spacing={3}>
            <Typography variant="h4">退款管理</Typography>

            <AppBar position="static" color="default">
              <Tabs
                value={activeStoreId}
                onChange={handleStoreChange}
                indicatorColor="primary"
                textColor="primary"
                variant="scrollable"
                scrollButtons="auto"
              >
                {stores.map((store) => (
                  <Tab key={store.store_id} value={store.store_id} label={store.store_name} />
                ))}
              </Tabs>
            </AppBar>

            {/* 统计卡片 */}
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" variant="body2">
                      待处理
                    </Typography>
                    <Typography variant="h4" color="warning.main">
                      {statusStats?.pending}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" variant="body2">
                      已退款
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      {statusStats?.completed}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" variant="body2">
                      已拒绝
                    </Typography>
                    <Typography variant="h4" color="error.main">
                      {statusStats?.rejected}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" variant="body2">
                      已取消
                    </Typography>
                    <Typography variant="h4">{statusStats?.cancelled}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Tab 筛选 */}
            <Paper sx={{ p: 1 }}>
              <Tabs value={currentTab} onChange={handleTabChange}>
                <Tab label="全部" value={null} />
                <Tab label={`待处理 (${statusStats.pending})`} value={0} />
                <Tab label={`已退款 (${statusStats.completed})`} value={1} />
                <Tab label={`已拒绝 (${statusStats.rejected})`} value={2} />
              </Tabs>
            </Paper>

            {/* 退款列表 */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>退款单号</TableCell>
                    <TableCell>订单号</TableCell>
                    <TableCell>退款金额</TableCell>
                    <TableCell>退款原因</TableCell>
                    <TableCell>状态</TableCell>
                    <TableCell>申请时间</TableCell>
                    <TableCell>操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <CircularPercentageLoading loading={loading}>
                    {refundList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          暂无数据
                        </TableCell>
                      </TableRow>
                    ) : (
                      refundList.map((refund) => (
                        <TableRow key={refund.refund_id}>
                          <TableCell>{refund.refund_id.slice(0, 8)}...</TableCell>
                          <TableCell>{refund.order_id}</TableCell>
                          <TableCell>¥{(refund.money / 100).toFixed(2)}</TableCell>
                          <TableCell>{refund.reason}</TableCell>
                          <TableCell>
                            <Chip
                              label={statusConfig[refund.status]?.text || "未知"}
                              color={statusConfig[refund.status]?.color || "default"}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {dayjs(refund.create_date).format("YYYY-MM-DD HH:mm")}
                          </TableCell>
                          <TableCell>
                            {refund.status === 0 ? (
                              <Stack direction="row" spacing={1}>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="primary"
                                  onClick={() => openHandleDialog(refund, "approve")}
                                >
                                  同意
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  onClick={() => openHandleDialog(refund, "reject")}
                                >
                                  拒绝
                                </Button>
                              </Stack>
                            ) : (
                              <Typography variant="body2" color="textSecondary">
                                {refund.status === 1 &&
                                  `已于 ${dayjs(refund.handled_at).format("MM-DD HH:mm")} 退款`}
                                {refund.status === 2 && `拒绝原因: ${refund.reject_reason}`}
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </CircularPercentageLoading>
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </Container>
      </Box>

      {/* 处理弹窗 */}
      <Dialog open={handleDialog.open} onClose={closeHandleDialog}>
        <DialogTitle>{handleDialog.action === "approve" ? "确认退款" : "拒绝退款"}</DialogTitle>
        <DialogContent>
          {handleDialog.action === "approve" ? (
            <Typography>
              确认同意退款 ¥{((handleDialog.refund?.money || 0) / 100).toFixed(2)}？
            </Typography>
          ) : (
            <TextField
              fullWidth
              label="拒绝原因"
              multiline
              rows={3}
              value={handleDialog.rejectReason}
              onChange={(e) =>
                setHandleDialog((prev) => ({ ...prev, rejectReason: e.target.value }))
              }
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeHandleDialog}>取消</Button>
          <Button
            variant="contained"
            color={handleDialog.action === "approve" ? "primary" : "error"}
            onClick={submitHandle}
          >
            确认
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

RefundPage.getLayout = (page: JSX.Element) => <DashboardLayout>{page}</DashboardLayout>;

export default RefundPage;
