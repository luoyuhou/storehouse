import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import PlusIcon from "@heroicons/react/24/solid/PlusIcon";
import { get, post } from "src/lib/http";
import { toast } from "react-toastify";
import {
  StoreServicePlan,
  StoreServiceSubscription,
  formatDate,
} from "src/sections/store-service/types";
import {
  StoreServiceStatusCellRender,
  StoreServiceSubscriptionCellRender,
} from "src/sections/store-service/store-service-cell.components";

export function StoreServiceSubscriptionsSection() {
  const [plans, setPlans] = useState<StoreServicePlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<StoreServiceSubscription[]>([]);
  const [total, setTotal] = useState(0);

  const [subDialogOpen, setSubDialogOpen] = useState(false);
  const [subStoreId, setSubStoreId] = useState("");
  const [subPlanId, setSubPlanId] = useState<number | "">("");

  const [filterStoreId, setFilterStoreId] = useState("");
  const [filterStatus, setFilterStatus] = useState<number | "">("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchData = async () => {
    const query = new URLSearchParams();
    if (filterStoreId.trim()) {
      query.append("store_id", filterStoreId.trim());
    }
    if (filterStatus !== "") {
      query.append("status", String(filterStatus));
    }
    query.append("page", String(page));
    query.append("pageSize", String(pageSize));

    const [plansRes, subsRes] = await Promise.all([
      get<{ data: StoreServicePlan[] }>("/api/store-service/plans"),
      get<{ data: StoreServiceSubscription[]; total: number }>(
        `/api/store-service/subscriptions?${query.toString()}`,
      ),
    ]);
    setPlans(plansRes.data || []);
    setSubscriptions(subsRes.data || []);
    setTotal(subsRes.total || 0);
  };

  useEffect(() => {
    fetchData().catch(() => undefined);
  }, [filterStoreId, filterStatus, page, pageSize]);

  const handleCreateSubscription = async () => {
    if (!subStoreId.trim() || !subPlanId) return;
    await post<{ data: StoreServiceSubscription }>({
      url: "/api/store-service/subscriptions",
      payload: {
        store_id: subStoreId.trim(),
        plan_id: subPlanId,
      },
    }).catch((err) => toast.error(err.message));
    setSubDialogOpen(false);
    setSubStoreId("");
    setSubPlanId("");
    setPage(1);
    fetchData();
  };

  const handleTerminateSubscription = async (sub: StoreServiceSubscription) => {
    await post<{ data: StoreServiceSubscription }>({
      url: `/api/store-service/subscriptions/${sub.id}/terminate`,
      payload: {},
    });
    fetchData();
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">店铺订阅</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            label="店铺ID（store_id）"
            size="small"
            value={filterStoreId}
            onChange={(e) => {
              setPage(1);
              setFilterStoreId(e.target.value);
            }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="sub-status-filter-label">状态</InputLabel>
            <Select
              labelId="sub-status-filter-label"
              label="状态"
              value={filterStatus}
              onChange={(e) => {
                setPage(1);
                setFilterStatus(e.target.value as number | "");
              }}
            >
              <MenuItem value="">全部</MenuItem>
              <MenuItem value={1}>生效中</MenuItem>
              <MenuItem value={2}>已过期</MenuItem>
              <MenuItem value={3}>已终止</MenuItem>
            </Select>
          </FormControl>
          <Button
            onClick={() => {
              setFilterStoreId("");
              setFilterStatus("");
              setPage(1);
            }}
          >
            重置
          </Button>
        </Stack>
        <Button
          variant="contained"
          startIcon={
            <SvgIcon fontSize="small">
              <PlusIcon />
            </SvgIcon>
          }
          onClick={() => setSubDialogOpen(true)}
        >
          新建订阅
        </Button>
      </Stack>

      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>店铺</TableCell>
              <TableCell>套餐</TableCell>
              <TableCell>开始日期</TableCell>
              <TableCell>结束日期</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subscriptions.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell>{sub.id}</TableCell>
                <TableCell>{sub.store_name || sub.store_id}</TableCell>
                <TableCell>{sub.plan?.name}</TableCell>
                <TableCell>{formatDate(sub.start_date)}</TableCell>
                <TableCell>{formatDate(sub.end_date)}</TableCell>
                <TableCell>
                  <StoreServiceSubscriptionCellRender value={sub.status} />
                </TableCell>
                <TableCell>
                  {sub.status === 1 && (
                    <Button size="small" onClick={() => handleTerminateSubscription(sub)}>
                      终止
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={subDialogOpen} onClose={() => setSubDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>新建订阅</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="店铺ID（store_id）"
              fullWidth
              value={subStoreId}
              onChange={(e) => setSubStoreId(e.target.value)}
            />
            <FormControl fullWidth>
              <InputLabel id="plan-select-label">套餐</InputLabel>
              <Select
                labelId="plan-select-label"
                label="套餐"
                value={subPlanId}
                onChange={(e) => setSubPlanId(e.target.value as number)}
              >
                {plans.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}（{(p.monthly_fee / 100).toFixed(2)} 元/月）
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleCreateSubscription}>
            创建
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
