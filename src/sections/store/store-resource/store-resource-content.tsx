import React, { useCallback, useEffect, useState } from "react";
import { get, post } from "src/lib/http";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  Stack,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Unstable_Grid2 as Grid,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";

interface ResourceInfo {
  total_quota: number;
  used_quota: number;
}

interface QuotaOrder {
  id: number;
  order_id: string;
  quota_amount: number;
  price: number;
  status: number;
  create_date: string;
}

function getColorByPercent(percent: number) {
  if (percent > 90) return "error";
  if (percent > 70) return "warning";
  return "primary";
}

export function StoreResourceContent({ storeId }: { storeId: string }) {
  const [info, setInfo] = useState<ResourceInfo | null>(null);
  const [orders, setOrders] = useState<QuotaOrder[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInfo = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    get<{ data: ResourceInfo }>(`/api/store-resource/info?store_id=${storeId}`)
      .then((res) => setInfo(res.data))
      .catch((err) => toast.error((err as { message: string }).message))
      .finally(() => setLoading(false));
  }, [storeId]);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await get<{ data: QuotaOrder[] }>(
        `/api/store-resource/orders?store_id=${storeId}`,
      );
      setOrders(res.data);
    } catch (err) {
      toast.error((err as { message: string }).message);
    }
  }, [storeId]);

  useEffect(() => {
    fetchInfo();
    fetchOrders();
  }, [fetchInfo, fetchOrders]);

  const handleApply = async () => {
    try {
      await post({
        url: "/api/store-resource/apply-quota",
        payload: {
          store_id: storeId,
          quota_amount: 50 * 1024 * 1024, // 50MB
          price: 0,
        },
      });
      toast.success("申请已提交，请等待管理员审批");
      fetchOrders();
    } catch (err) {
      toast.error((err as { message: string }).message);
    }
  };

  const totalMB = info ? Number(info.total_quota) / (1024 * 1024) : 0;
  const usedMB = info ? Number(info.used_quota) / (1024 * 1024) : 0;
  const percent = totalMB > 0 ? (usedMB / totalMB) * 100 : 0;

  return (
    <Grid container spacing={3}>
      <Grid xs={12} md={7}>
        <Card sx={{ height: "100%" }}>
          <CardHeader title="存储空间概览" subheader="实时统计该商店所有商品图片占用的总空间" />
          <Divider />
          <CardContent>
            <Stack spacing={3}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                }}
              >
                <Box>
                  <Typography variant="h4" color="primary">
                    {usedMB.toFixed(2)} MB
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    已使用空间
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography variant="h6">{totalMB.toFixed(0)} MB</Typography>
                  <Typography variant="caption" color="textSecondary">
                    总配额
                  </Typography>
                </Box>
              </Box>

              <Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(percent, 100)}
                  sx={{ height: 12, borderRadius: 6, bgcolor: "action.hover" }}
                  color={getColorByPercent(percent)}
                />
                <Box sx={{ mt: 1, display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="caption" color="textSecondary">
                    使用率: {percent.toFixed(1)}%
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    剩余: {(totalMB - usedMB).toFixed(2)} MB
                  </Typography>
                </Box>
              </Box>

              {percent > 90 && (
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "error.light",
                    borderRadius: 1,
                    color: "error.contrastText",
                  }}
                >
                  <Typography variant="body2">
                    警告：存储空间即将用尽。请立即申请扩容，以免影响商品图片上传。
                  </Typography>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid xs={12} md={5}>
        <Card
          sx={{
            height: "100%",
            border: "2px dashed",
            borderColor: "divider",
            bgcolor: "transparent",
          }}
        >
          <CardHeader title="申请扩容" subheader="单次扩容增加 50MB 永久存储额度" />
          <Divider />
          <CardContent>
            <Stack spacing={3} alignItems="center" justifyContent="center" sx={{ py: 2 }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h3" gutterBottom color="primary">
                  +50 MB
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  价格：¥ 0.00
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  * 申请后需管理员在后台点击确认，额度将立即生效。
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleApply}
                disabled={loading}
                sx={{ py: 1.5, fontSize: "1.1rem" }}
              >
                立即申请
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid xs={12}>
        <Card>
          <CardHeader title="扩容申请记录" />
          <Divider />
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>订单号</TableCell>
                <TableCell>扩容大小</TableCell>
                <TableCell>价格</TableCell>
                <TableCell>状态</TableCell>
                <TableCell align="right">申请时间</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell>{order.order_id}</TableCell>
                  <TableCell>{Number(order.quota_amount) / (1024 * 1024)} MB</TableCell>
                  <TableCell>¥{order.price}</TableCell>
                  <TableCell>
                    <Chip
                      label={order.status === 1 ? "已生效" : "审核中"}
                      color={order.status === 1 ? "success" : "warning"}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {new Date(order.create_date).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">暂无申请记录</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </Grid>
    </Grid>
  );
}
