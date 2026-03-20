import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
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
import { StoreServicePlan } from "src/sections/store-service/types";
import { toast } from "react-toastify";

export function StoreServicePlansSection() {
  const [plans, setPlans] = useState<StoreServicePlan[]>([]);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanDesc, setNewPlanDesc] = useState("");
  const [newPlanPrice, setNewPlanPrice] = useState("");

  const fetchPlans = async () => {
    const res = await get<{ data: StoreServicePlan[] }>("/api/store/service/plans");
    setPlans(res.data || []);
  };

  useEffect(() => {
    fetchPlans().catch(() => undefined);
  }, []);

  const handleCreatePlan = async () => {
    const price = Number(newPlanPrice);
    if (!newPlanName.trim() || price < 0) return;
    post<{ data: StoreServicePlan }>({
      url: "/api/store/service/plans",
      payload: {
        name: newPlanName.trim(),
        description: newPlanDesc || undefined,
        monthly_fee: price * 100,
      },
    })
      .then(() => {
        setPlanDialogOpen(false);
        setNewPlanName("");
        setNewPlanDesc("");
        setNewPlanPrice("");
        fetchPlans();
      })
      .catch((err) => toast.error(JSON.stringify(err.message)));
  };

  const handleTogglePlanActive = async (plan: StoreServicePlan) => {
    await post<{ data: StoreServicePlan }>({
      url: `/api/store/service/plans/${plan.id}/status`,
      payload: { is_active: !plan.is_active },
    });
    fetchPlans();
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">店铺服务套餐</Typography>
        <Button
          variant="contained"
          startIcon={
            <SvgIcon fontSize="small">
              <PlusIcon />
            </SvgIcon>
          }
          onClick={() => setPlanDialogOpen(true)}
        >
          新建套餐
        </Button>
      </Stack>

      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>名称</TableCell>
              <TableCell>描述</TableCell>
              <TableCell>月费</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell>{plan.id}</TableCell>
                <TableCell>{plan.name}</TableCell>
                <TableCell>{plan.description || "-"}</TableCell>
                <TableCell>{(plan.monthly_fee / 100).toFixed(2)}</TableCell>
                <TableCell>{plan.is_active ? "启用" : "停用"}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => handleTogglePlanActive(plan)}>
                    {plan.is_active ? "停用" : "启用"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog
        open={planDialogOpen}
        onClose={() => setPlanDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>新建套餐</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="套餐名称"
              fullWidth
              value={newPlanName}
              onChange={(e) => setNewPlanName(e.target.value)}
            />
            <TextField
              label="描述"
              fullWidth
              multiline
              minRows={2}
              value={newPlanDesc}
              onChange={(e) => setNewPlanDesc(e.target.value)}
            />
            <TextField
              label="月费（元）"
              fullWidth
              value={newPlanPrice}
              type="number"
              onChange={(e) => setNewPlanPrice(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPlanDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleCreatePlan}>
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
