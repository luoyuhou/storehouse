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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { get, post } from "src/lib/http";
import { StoreServiceInvoice, formatDate } from "./types";
import { StoreServiceStatusCellRender } from "./store-service-cell.components";

interface StoreServiceInvoicesSectionProps {
  currentStoreId?: string;
}

export function StoreServiceInvoicesSection({ currentStoreId }: StoreServiceInvoicesSectionProps) {
  const [invoices, setInvoices] = useState<StoreServiceInvoice[]>([]);
  const [total, setTotal] = useState(0);
  const [invoiceStoreId, setInvoiceStoreId] = useState(currentStoreId || "");
  const [invoiceStatus, setInvoiceStatus] = useState<number | "">("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [payInvoiceId, setPayInvoiceId] = useState<number | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("offline");

  const fetchInvoices = async () => {
    const query = new URLSearchParams();
    if (invoiceStoreId.trim()) {
      query.append("store_id", invoiceStoreId.trim());
    }
    if (invoiceStatus !== "") {
      query.append("status", String(invoiceStatus));
    }
    query.append("page", String(page));
    query.append("pageSize", String(pageSize));

    const res = await get<{
      data: StoreServiceInvoice[];
      total: number;
    }>(`/api/store-service/invoices?${query.toString()}`);
    setInvoices(res.data || []);
    setTotal(res.total || 0);
  };

  useEffect(() => {
    fetchInvoices().catch(() => undefined);
  }, [invoiceStoreId, invoiceStatus, page, pageSize]);

  const handleFilterInvoices = () => {
    setPage(1);
    fetchInvoices();
  };

  const handleResetInvoiceFilter = () => {
    setInvoiceStoreId("");
    setInvoiceStatus("");
    setPage(1);
    fetchInvoices();
  };

  const handlePayInvoice = async () => {
    if (!payInvoiceId) return;
    const amount = Number(payAmount);
    if (!amount || amount <= 0) return;
    await post<{ data: unknown }>({
      url: `/api/store-service/invoices/${payInvoiceId}/pay`,
      payload: {
        amount,
        method: payMethod,
      },
    });
    setPayDialogOpen(false);
    setPayInvoiceId(null);
    setPayAmount("");
    // fetchInvoices(invoiceStoreId || undefined);
    fetchInvoices();
  };

  return (
    <Box>
      <Typography variant="h5" mb={2}>
        账单列表
      </Typography>

      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <TextField
          label="按店铺ID筛选"
          size="small"
          value={invoiceStoreId}
          onChange={(e) => setInvoiceStoreId(e.target.value)}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="invoice-status-label">状态</InputLabel>
          <Select
            labelId="invoice-status-label"
            label="状态"
            value={invoiceStatus}
            onChange={(e) => {
              setInvoiceStatus(e.target.value as number | "");
              setPage(1);
            }}
          >
            <MenuItem value="">全部</MenuItem>
            <MenuItem value={0}>未支付</MenuItem>
            <MenuItem value={1}>已支付</MenuItem>
          </Select>
        </FormControl>
        <Button variant="outlined" onClick={handleFilterInvoices}>
          筛选
        </Button>
        {(invoiceStoreId || invoiceStatus !== "") && (
          <Button onClick={handleResetInvoiceFilter}>重置</Button>
        )}
      </Stack>

      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>店铺</TableCell>
              <TableCell>套餐</TableCell>
              <TableCell>月份</TableCell>
              <TableCell>金额/元</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>到期日</TableCell>
              <TableCell>支付时间</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell>{inv.id}</TableCell>
                <TableCell>{inv.subscription.store_name || inv.subscription.store_id}</TableCell>
                <TableCell>{inv.subscription.plan?.name}</TableCell>
                <TableCell>{inv.month}</TableCell>
                <TableCell>{(inv.amount / 100).toFixed(2)}</TableCell>
                <TableCell>
                  <StoreServiceStatusCellRender value={inv.status} />
                </TableCell>
                <TableCell>{formatDate(inv.due_date)}</TableCell>
                <TableCell>{formatDate(inv.paid_at || undefined)}</TableCell>
                <TableCell>
                  {inv.status !== 1 && (
                    <Button
                      size="small"
                      onClick={() => {
                        setPayInvoiceId(inv.id);
                        setPayAmount(String(inv.amount / 100));
                        setPayDialogOpen(true);
                      }}
                    >
                      录入支付
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={payDialogOpen} onClose={() => setPayDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>录入支付</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="支付金额/元"
              fullWidth
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
            />
            <FormControl fullWidth>
              <InputLabel id="pay-method-label">支付方式</InputLabel>
              <Select
                labelId="pay-method-label"
                label="支付方式"
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
              >
                <MenuItem value="offline">线下</MenuItem>
                <MenuItem value="alipay">支付宝</MenuItem>
                <MenuItem value="wechat">微信</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
