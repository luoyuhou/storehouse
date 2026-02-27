import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  Typography,
  Paper,
  Chip,
  Stack,
} from "@mui/material";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from "@mui/lab";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { LocalShipping, Cancel, DoneAll, AllInbox, ShoppingCart } from "@mui/icons-material";
import { get } from "src/lib/http";
import { toast } from "react-toastify";

interface OrderHistoryItem {
  id: number;
  order_action_id: string;
  order_id: string;
  user_id: string;
  status: number;
  create_date: string;
  user?: {
    user_id: string;
    first_name: string;
    last_name: string;
    username: string;
  } | null;
}

interface OrderSummary {
  order_id: string;
  payment_method?: "online_qr" | "cod" | "pickup_pay" | string;
  pay_status?: 0 | 1 | number | null;
  pay_proof_url?: string | null;
  paid_at?: string | null;
}

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  online_qr: "扫码支付",
  cod: "货到付款",
  pickup_pay: "到店付款",
};

const PAY_STATUS_CONFIG: Record<
  number,
  {
    label: string;
    color: "default" | "success";
  }
> = {
  0: { label: "未收款", color: "default" },
  1: { label: "已收款", color: "success" },
};

interface OrderHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber?: string;
}

// 状态配置映射
const STATUS_CONFIG: Record<
  number,
  {
    label: string;
    color: "primary" | "success" | "warning" | "error" | "info";
    icon: React.ReactNode;
    description: string;
  }
> = {
  "-2": {
    label: "订单已删除",
    color: "error",
    icon: <Cancel />,
    description: "订单已从系统中删除",
  },
  "-1": {
    label: "订单已取消",
    color: "error",
    icon: <Cancel />,
    description: "订单被取消",
  },
  1: {
    label: "订单创建",
    color: "info",
    icon: <ShoppingCart />,
    description: "用户下单成功，等待商家处理",
  },
  2: {
    label: "商家接单",
    color: "primary",
    icon: <AllInbox />,
    description: "商家已接单，商品准备中",
  },
  3: {
    label: "商家发货",
    color: "primary",
    icon: <LocalShipping />,
    description: "商家已发货，商品配送中",
  },
  4: {
    label: "用户确认收货",
    color: "success",
    icon: <CheckCircleIcon />,
    description: "用户已确认收到商品",
  },
  5: {
    label: "订单完成",
    color: "success",
    icon: <DoneAll />,
    description: "订单交易完成",
  },
};

export function OrderHistoryDialog({
  open,
  onClose,
  orderId,
  orderNumber,
}: OrderHistoryDialogProps) {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<OrderHistoryItem[]>([]);
  const [order, setOrder] = useState<OrderSummary | null>(null);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const response = await get<{ order: OrderSummary | null; history: OrderHistoryItem[] }>(
        `/api/store/order/history/${orderId}`,
      );
      setOrder(response.order || null);
      setHistory(response.history || []);
    } catch (err) {
      toast.error((err as { message: string }).message || "加载订单历史失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && orderId) {
      loadHistory();
    }
  }, [open, orderId]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">订单时间线</Typography>
          {orderNumber && <Chip label={`订单号: ${orderNumber}`} size="small" variant="outlined" />}
        </Stack>
      </DialogTitle>
      <DialogContent>
        {order && (
          <Box sx={{ mb: 3 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                支付信息
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                <Chip
                  label={PAYMENT_METHOD_LABEL[order.payment_method || "online_qr"] || "扫码支付"}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={PAY_STATUS_CONFIG[(order.pay_status ?? 0) as number]?.label || "未收款"}
                  color={
                    (PAY_STATUS_CONFIG[(order.pay_status ?? 0) as number]?.color ||
                      "default") as never
                  }
                  size="small"
                />
                {order.paid_at && (
                  <Typography variant="caption" color="textSecondary">
                    收款时间：
                    {format(new Date(order.paid_at), "yyyy-MM-dd HH:mm:ss")}
                  </Typography>
                )}
              </Stack>
              {order.pay_proof_url && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="textSecondary" gutterBottom>
                    支付凭证：
                  </Typography>
                  <Box
                    component="img"
                    src={order.pay_proof_url}
                    alt="支付凭证"
                    sx={{
                      mt: 0.5,
                      maxWidth: 260,
                      borderRadius: 1,
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                    }}
                  />
                </Box>
              )}
            </Paper>
          </Box>
        )}
        {/* eslint-disable-next-line no-nested-ternary */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : history.length > 0 ? (
          <Timeline position="right">
            {history.map((item, index) => {
              const config = STATUS_CONFIG[item.status] || {
                label: `状态 ${item.status}`,
                color: "default" as const,
                icon: <CheckCircleIcon />,
                description: "订单状态变更",
              };

              const isLast = index === history.length - 1;

              return (
                <TimelineItem key={item.order_action_id}>
                  <TimelineOppositeContent color="textSecondary" sx={{ flex: 0.3 }}>
                    <Typography variant="body2">
                      {format(new Date(item.create_date), "yyyy-MM-dd", { locale: zhCN })}
                    </Typography>
                    <Typography variant="caption">
                      {format(new Date(item.create_date), "HH:mm:ss")}
                    </Typography>
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot color={config.color}>{config.icon}</TimelineDot>
                    {!isLast && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent>
                    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                      <Typography variant="h6" component="div" gutterBottom>
                        {config.label}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {config.description}
                      </Typography>
                      {item.user && (
                        <Typography variant="caption" color="textSecondary">
                          操作人: {item.user.first_name}
                          {item.user.last_name}
                        </Typography>
                      )}
                    </Paper>
                  </TimelineContent>
                </TimelineItem>
              );
            })}
          </Timeline>
        ) : (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography variant="body2" color="textSecondary">
              暂无订单历史记录
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>关闭</Button>
      </DialogActions>
    </Dialog>
  );
}
