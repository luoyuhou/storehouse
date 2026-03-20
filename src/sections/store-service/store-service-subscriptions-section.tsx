import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Collapse,
  FormControl,
  IconButton,
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
  Chip,
} from "@mui/material";
import { get } from "src/lib/http";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import {
  StoreServicePlan,
  StoreServiceSubscription,
  formatDate,
} from "src/sections/store-service/types";
import {
  StoreServiceSubscriptionCellRender,
  StoreServiceStatusCellRender,
  StoreServiceContractStatusCellRender,
} from "src/sections/store-service/store-service-cell.components";

interface Invoice {
  id: number;
  subscription_id: number;
  month: string;
  start_date: string;
  end_date: string;
  amount: number;
  status: number;
  due_date: string;
  paid_at?: string | null;
}

interface Contract {
  id: number;
  contract_no: string;
  store_id: string;
  plan_id: number;
  start_date: string;
  end_date: string;
  status: number;
  sign_type: number;
  signed_at?: string | null;
  total_amount: number;
  file_url?: string | null;
}

interface SubscriptionWithDetails extends StoreServiceSubscription {
  invoice?: Invoice[];
  contract?: Contract | null;
}

function SubscriptionRow({ sub }: { sub: SubscriptionWithDetails }) {
  const [open, setOpen] = useState(false);
  const latestInvoice = sub.invoice?.[0];

  return (
    <>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell>{sub.store_name || sub.store_id}</TableCell>
        <TableCell>{sub.plan?.name}</TableCell>
        <TableCell>{formatDate(sub.start_date)}</TableCell>
        <TableCell>{formatDate(sub.end_date)}</TableCell>
        <TableCell>
          <StoreServiceSubscriptionCellRender value={sub.status} />
        </TableCell>
        <TableCell>
          {latestInvoice ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2">¥{(latestInvoice.amount / 100).toFixed(2)}</Typography>
              <Chip
                label={latestInvoice.status === 1 ? "已支付" : "待支付"}
                color={latestInvoice.status === 1 ? "success" : "warning"}
                size="small"
              />
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              -
            </Typography>
          )}
        </TableCell>
        <TableCell>
          {sub.contract ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2">{sub.contract.contract_no}</Typography>
              <StoreServiceContractStatusCellRender value={sub.contract.status} />
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              -
            </Typography>
          )}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                详细信息
              </Typography>
              <Stack direction="row" spacing={4}>
                {/* 账单列表 */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary" mb={1}>
                    账单记录 ({sub.invoice?.length || 0})
                  </Typography>
                  {sub.invoice && sub.invoice.length > 0 ? (
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>月份</TableCell>
                          <TableCell>金额</TableCell>
                          <TableCell>状态</TableCell>
                          <TableCell>到期日</TableCell>
                          <TableCell>支付时间</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sub.invoice.map((inv) => (
                          <TableRow key={inv.id}>
                            <TableCell>{inv.month}</TableCell>
                            <TableCell>¥{(inv.amount / 100).toFixed(2)}</TableCell>
                            <TableCell>
                              <StoreServiceStatusCellRender value={inv.status} />
                            </TableCell>
                            <TableCell>{formatDate(inv.due_date)}</TableCell>
                            <TableCell>{formatDate(inv.paid_at || undefined)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      暂无账单
                    </Typography>
                  )}
                </Box>

                {/* 合同信息 */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary" mb={1}>
                    合同信息
                  </Typography>
                  {sub.contract ? (
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell component="th" scope="row">
                            合同号
                          </TableCell>
                          <TableCell>{sub.contract.contract_no}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">
                            有效期
                          </TableCell>
                          <TableCell>
                            {formatDate(sub.contract.start_date)} ~{" "}
                            {formatDate(sub.contract.end_date)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">
                            总金额
                          </TableCell>
                          <TableCell>¥{(sub.contract.total_amount / 100).toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">
                            状态
                          </TableCell>
                          <TableCell>
                            <StoreServiceContractStatusCellRender value={sub.contract.status} />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">
                            签署方式
                          </TableCell>
                          <TableCell>
                            {/* eslint-disable-next-line no-nested-ternary */}
                            {sub.contract.sign_type === 1
                              ? "线下签署"
                              : sub.contract.sign_type === 2
                                ? "电子签署"
                                : "其他"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">
                            签署时间
                          </TableCell>
                          <TableCell>{formatDate(sub.contract.signed_at || undefined)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      暂无合同
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export function StoreServiceSubscriptionsSection() {
  const [plans, setPlans] = useState<StoreServicePlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithDetails[]>([]);
  const [total, setTotal] = useState(0);

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
      get<{ data: StoreServicePlan[] }>("/api/store/service/plans"),
      get<{ data: SubscriptionWithDetails[]; total: number }>(
        `/api/store/service/subscriptions?${query.toString()}`,
      ),
    ]);
    setPlans(plansRes.data || []);
    setSubscriptions(subsRes.data || []);
    setTotal(subsRes.total || 0);
  };

  useEffect(() => {
    fetchData().catch(() => undefined);
  }, [filterStoreId, filterStatus, page, pageSize]);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">店铺订阅（含账单与合同）</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            label="店铺ID（store_id）"
            size="small"
            value={filterStoreId}
            placeholder=""
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
              <MenuItem value={0}>待审核</MenuItem>
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
      </Stack>

      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>店铺</TableCell>
              <TableCell>套餐</TableCell>
              <TableCell>开始日期</TableCell>
              <TableCell>结束日期</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>最新账单</TableCell>
              <TableCell>合同</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subscriptions.map((sub) => (
              <SubscriptionRow key={sub.id} sub={sub} />
            ))}
            {subscriptions.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography color="text.secondary" sx={{ py: 4 }}>
                    暂无数据
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
