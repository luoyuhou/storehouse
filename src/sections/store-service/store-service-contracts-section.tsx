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
import { StoreServiceContractStatusCellRender } from "./store-service-cell.components";
import { StoreServicePlan, formatDate } from "./types";

interface StoreServiceContract {
  id: number;
  contract_no: string;
  store_id: string;
  store_name?: string;
  plan_id: number;
  plan_name?: string;
  start_date: string;
  end_date: string;
  status: number;
  sign_type: number;
  signed_at?: string | null;
  total_amount: number;
  file_url?: string | null;
}

interface StoreServiceContractsSectionProps {
  currentStoreId?: string;
}

export function StoreServiceContractsSection({
  currentStoreId,
}: StoreServiceContractsSectionProps) {
  const [contracts, setContracts] = useState<StoreServiceContract[]>([]);
  const [plans, setPlans] = useState<StoreServicePlan[]>([]);
  const [total, setTotal] = useState(0);

  const [filterStoreId, setFilterStoreId] = useState("");
  const [filterStatus, setFilterStatus] = useState<number | "">("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formPlanId, setFormPlanId] = useState<number | "">("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formTotalAmount, setFormTotalAmount] = useState("");
  const [formSignType, setFormSignType] = useState<number | "">(1);
  const [formContractNo, setFormContractNo] = useState("");
  const [formFileUrl, setFormFileUrl] = useState("");
  const [formStoreId, setFormStoreId] = useState("");

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

    const [plansRes, contractsRes] = await Promise.all([
      get<{ data: StoreServicePlan[] }>("/api/store-service/plans"),
      get<{
        data: StoreServiceContract[];
        total: number;
      }>(`/api/store-service/contracts?${query.toString()}`),
    ]);

    setPlans(plansRes.data || []);
    setContracts(contractsRes.data || []);
    setTotal(contractsRes.total || 0);
  };

  useEffect(() => {
    fetchData().catch(() => undefined);
  }, [filterStoreId, filterStatus, page, pageSize]);

  const handleCreateContract = async () => {
    if (!currentStoreId || !formPlanId || !formStartDate || !formEndDate) {
      return;
    }
    const totalAmount = Number(formTotalAmount);
    if (totalAmount < 0) return;

    await post<{ data: StoreServiceContract }>({
      url: "/api/store-service/contracts",
      payload: {
        store_id: formStoreId.trim(),
        plan_id: formPlanId,
        contract_no: formContractNo || undefined,
        start_date: new Date(formStartDate),
        end_date: new Date(formEndDate),
        total_amount: Math.round(totalAmount * 100),
        sign_type: formSignType || 1,
        file_url: formFileUrl || undefined,
      },
    });

    setDialogOpen(false);
    setFormPlanId("");
    setFormStartDate("");
    setFormEndDate("");
    setFormTotalAmount("");
    setFormSignType(1);
    setFormContractNo("");
    setFormFileUrl("");
    setPage(1);
    fetchData();
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">合同列表</Typography>
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
            <InputLabel id="contract-status-filter-label">状态</InputLabel>
            <Select
              labelId="contract-status-filter-label"
              label="状态"
              value={filterStatus}
              onChange={(e) => {
                setPage(1);
                setFilterStatus(e.target.value as number | "");
              }}
            >
              <MenuItem value="">全部</MenuItem>
              <MenuItem value={1}>生效中</MenuItem>
              <MenuItem value={2}>已到期</MenuItem>
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
          <Button
            variant="contained"
            startIcon={
              <SvgIcon fontSize="small">
                <PlusIcon />
              </SvgIcon>
            }
            onClick={() => setDialogOpen(true)}
          >
            新建合同
          </Button>
        </Stack>
      </Stack>

      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>合同号</TableCell>
              <TableCell>店铺</TableCell>
              <TableCell>套餐</TableCell>
              <TableCell>有效期</TableCell>
              <TableCell>总金额/元</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>签署方式</TableCell>
              <TableCell>签署时间</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contracts.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.id}</TableCell>
                <TableCell>{c.contract_no}</TableCell>
                <TableCell>{c.store_name || c.store_id}</TableCell>
                <TableCell>{c.plan_name}</TableCell>
                <TableCell>
                  {formatDate(c.start_date)} ~ {formatDate(c.end_date)}
                </TableCell>
                <TableCell>{(c.total_amount / 100).toFixed(2)}</TableCell>
                <TableCell>
                  <StoreServiceContractStatusCellRender value={c.status} />
                </TableCell>
                <TableCell>
                  {/* eslint-disable-next-line no-nested-ternary */}
                  {c.sign_type === 1 ? "线下签署" : c.sign_type === 2 ? "电子签署" : "其他"}
                </TableCell>
                <TableCell>{formatDate(c.signed_at || undefined)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>新建合同</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="合同号（可选，不填自动生成）"
              fullWidth
              value={formContractNo}
              onChange={(e) => setFormContractNo(e.target.value)}
            />
            <TextField
              label="店铺ID（store_id）"
              fullWidth
              value={formStoreId}
              onChange={(e) => setFormStoreId(e.target.value)}
            />
            <FormControl fullWidth>
              <InputLabel id="contract-plan-select-label">套餐</InputLabel>
              <Select
                labelId="contract-plan-select-label"
                label="套餐"
                value={formPlanId}
                onChange={(e) => setFormPlanId(e.target.value as number)}
              >
                {plans.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}（{(p.monthly_fee / 100).toFixed(2)} 元/月）
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="开始日期"
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={formStartDate}
              onChange={(e) => setFormStartDate(e.target.value)}
            />
            <TextField
              label="结束日期"
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={formEndDate}
              onChange={(e) => setFormEndDate(e.target.value)}
            />
            <TextField
              label="合同总金额（元）"
              type="number"
              fullWidth
              value={formTotalAmount}
              onChange={(e) => setFormTotalAmount(e.target.value)}
            />
            <FormControl fullWidth>
              <InputLabel id="sign-type-label">签署方式</InputLabel>
              <Select
                labelId="sign-type-label"
                label="签署方式"
                value={formSignType}
                onChange={(e) => setFormSignType(e.target.value as number)}
              >
                <MenuItem value={1}>线下签署</MenuItem>
                <MenuItem value={2}>电子签署</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="合同文件地址（可选）"
              fullWidth
              value={formFileUrl}
              onChange={(e) => setFormFileUrl(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleCreateContract}>
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
