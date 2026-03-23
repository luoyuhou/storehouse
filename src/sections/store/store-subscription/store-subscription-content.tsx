import React, { useCallback, useEffect, useState } from "react";
import { get, post } from "src/lib/http";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Unstable_Grid2 as Grid,
} from "@mui/material";
import {
  CalendarIcon,
  CheckCircleIcon,
  CreditCardIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/solid";
import { StoreSubscriptionPlan } from "src/types/store.type";

interface Subscription {
  id: number;
  plan: StoreSubscriptionPlan;
  start_date: string;
  end_date: string;
  status: number;
  order_count_last_cycle: number;
  create_date: string;
}

function getWordByStatus(status: number) {
  if (status === 1) return "生效中";
  if (status === 0) return "待审核";
  return "已失效";
}

function getColorByStatus(status: number) {
  if (status === 1) return "success";
  if (status === 0) return "warning";
  return "default";
}

function isPlanAvailable(plan: StoreSubscriptionPlan): boolean {
  // 如果 max_subscriptions 为 null 或 undefined，表示无限次
  if (plan.max_subscriptions === null || plan.max_subscriptions === undefined) {
    return true;
  }
  // 如果 current_subscriptions 存在且已达到上限，则不可用
  const current = plan.current_subscriptions || 0;
  return current < plan.max_subscriptions;
}

function getRemainingText(plan: StoreSubscriptionPlan): string | null {
  if (plan.max_subscriptions === null || plan.max_subscriptions === undefined) {
    return null;
  }
  const current = plan.current_subscriptions || 0;
  const remaining = plan.max_subscriptions - current;
  if (remaining <= 0) {
    return `已达订阅上限 (${plan.max_subscriptions} 次)`;
  }
  return `本店剩余: ${remaining}/${plan.max_subscriptions} 次`;
}

export function StoreSubscriptionContent({ storeId }: { storeId: string }) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<StoreSubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(() => {
    if (!storeId) return;
    setLoading(true);
    Promise.all([
      get<{ data: Subscription[] }>(`/api/store/service/subscriptions?store_id=${storeId}`),
      get<{ data: StoreSubscriptionPlan[] }>(`/api/store/service/plans?store_id=${storeId}`),
    ])
      .then(([subRes, plansRes]) => {
        setSubscriptions(subRes.data);
        setPlans(plansRes.data || []);
      })
      .catch((err) => toast.error((err as { message: string }).message))
      .finally(() => setLoading(false));
  }, [storeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubscribe = async (planId: string) => {
    try {
      await post({
        url: "/api/store/service/subscriptions",
        payload: {
          store_id: storeId,
          plan_id: planId,
          start_date: new Date().toISOString(),
        },
      });
      toast.success("订阅申请已提交，请等待管理员确认");
      fetchData();
    } catch (err) {
      toast.error((err as { message: string }).message);
    }
  };

  const currentActiveSub = subscriptions.find((s) => s.status === 1);
  const pendingSub = subscriptions.find((s) => s.status === 0);

  return (
    <Stack spacing={4}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h5">当前订阅状态</Typography>
          <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 1 }}>
            管理商铺 ({storeId}) 的服务订阅等级。
          </Typography>
        </Box>
        {currentActiveSub ? (
          <Chip
            icon={<CheckCircleIcon width={16} />}
            label="当前订阅：无限额度版"
            color="success"
            sx={{ py: 2.5, px: 1, fontSize: "0.9rem" }}
          />
        ) : (
          <Chip
            label="当前状态：普通商家 (限额 10 单/日)"
            color="default"
            sx={{ py: 2.5, px: 1, fontSize: "0.9rem" }}
          />
        )}
      </Stack>

      {currentActiveSub && (
        <Card sx={{ bgcolor: "primary.lightest", borderColor: "primary.main", border: 1 }}>
          <CardContent sx={{ py: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid xs={12} md={3}>
                <Typography variant="overline" color="textSecondary">
                  当前套餐
                </Typography>
                <Typography variant="h6" color="primary">
                  {currentActiveSub.plan.name}
                </Typography>
              </Grid>
              <Grid xs={12} md={3}>
                <Typography variant="overline" color="textSecondary">
                  到期日期
                </Typography>
                <Typography variant="h6">
                  {new Date(currentActiveSub.end_date).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid xs={12} md={3}>
                <Typography variant="overline" color="textSecondary">
                  状态
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography variant="h6" color="success.main">
                    生效中
                  </Typography>
                </Box>
              </Grid>
              <Grid xs={12} md={3} sx={{ textAlign: "right" }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleSubscribe(currentActiveSub.plan.plan_id)}
                >
                  续费申请
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {pendingSub && !currentActiveSub && (
        <Paper
          sx={{
            p: 2,
            bgcolor: "warning.lightest",
            color: "warning.main",
            border: 1,
            borderColor: "warning.main",
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            您有一个待审核的订阅申请：{pendingSub.plan.name}。请耐心等待管理员通过。
          </Typography>
        </Paper>
      )}

      <Grid container spacing={3}>
        {plans.map((plan) => {
          const planAvailable = isPlanAvailable(plan);
          const remainingText = getRemainingText(plan);
          return (
            <Grid xs={12} md={6} key={plan.plan_id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  // eslint-disable-next-line no-nested-ternary
                  ...(!planAvailable
                    ? {
                        opacity: 0.6,
                        bgcolor: "action.disabledBackground",
                      }
                    : currentActiveSub?.plan.plan_id === plan.plan_id
                      ? {
                          border: "2px solid",
                          borderColor: "primary.main",
                        }
                      : {}),
                }}
              >
                {!planAvailable && (
                  <Box sx={{ position: "absolute", top: 12, right: 12 }}>
                    <Chip label="已达上限" color="error" size="small" />
                  </Box>
                )}
                {planAvailable && currentActiveSub?.plan.plan_id === plan.plan_id && (
                  <Box sx={{ position: "absolute", top: 12, right: 12 }}>
                    <Chip label="当前版本" color="primary" size="small" />
                  </Box>
                )}
                <CardHeader
                  title={plan.name}
                  subheader={plan.description}
                  titleTypographyProps={{ variant: "h5", color: "primary" }}
                />
                <Divider />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack spacing={3}>
                    <Box sx={{ display: "flex", alignItems: "baseline" }}>
                      <Typography variant="h3">¥{(plan.monthly_fee / 100).toFixed(2)}</Typography>
                      <Typography variant="subtitle1" color="textSecondary" sx={{ ml: 1 }}>
                        / 月
                      </Typography>
                    </Box>

                    {remainingText && (
                      <Box
                        sx={{
                          p: 1.5,
                          bgcolor: planAvailable ? "warning.lightest" : "error.lightest",
                          borderRadius: 1,
                        }}
                      >
                        <Typography
                          variant="body2"
                          color={planAvailable ? "warning.dark" : "error.dark"}
                        >
                          {remainingText}
                        </Typography>
                      </Box>
                    )}

                    <List sx={{ bgcolor: "action.hover", borderRadius: 1 }}>
                      <ListItem divider>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <ShoppingBagIcon width={20} color="green" />
                        </ListItemIcon>
                        <ListItemText
                          primary="解锁无限下单额度"
                          secondary="不再受每日 10 单的免费额度限制"
                          primaryTypographyProps={{ fontWeight: "bold" }}
                        />
                      </ListItem>
                      <ListItem divider>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CreditCardIcon width={20} color="green" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`按需付费：¥${(plan.monthly_fee / 100).toFixed(2)} + 订单分成`}
                          secondary="每完成 1 单收货订单，下月续费仅加收 ¥0.1 元"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CalendarIcon width={20} color="green" />
                        </ListItemIcon>
                        <ListItemText primary="灵活订阅" secondary="按月自动计费，随时可申请停用" />
                      </ListItem>
                    </List>

                    <Box sx={{ p: 2, bgcolor: "primary.lightest", borderRadius: 1 }}>
                      <Typography variant="caption" color="primary">
                        * 计费公式：续费金额 = {(plan.monthly_fee / 100).toFixed(2)}元 (基础服务费)
                        + 上个周期有效订单数 (订单量加成, 扣去每天10单的免费额度)
                      </Typography>
                      <hr />
                      <Typography variant="caption" color="primary">
                        * 举例说明：{(plan.monthly_fee / 100).toFixed(2)}元 +
                        [400（上个周期有效订单数）- 28 (如：二月28天) * 10 (每天 10 单 免费额度)] *
                        0.1元
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
                <Divider />
                <Box sx={{ p: 2 }}>
                  <Button
                    variant={
                      currentActiveSub?.plan.plan_id === plan.plan_id ? "outlined" : "contained"
                    }
                    fullWidth
                    size="large"
                    onClick={() => handleSubscribe(plan.plan_id)}
                    disabled={loading || !planAvailable || (pendingSub && !currentActiveSub)}
                    sx={{ py: 1.5, fontSize: "1.1rem" }}
                  >
                    {/* eslint-disable-next-line no-nested-ternary */}
                    {!planAvailable
                      ? "已达上限"
                      : currentActiveSub?.plan.plan_id === plan.plan_id
                        ? "续费当前套餐"
                        : "立即升级订阅"}
                  </Button>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Card>
        <CardHeader title="订阅与账单历史" />
        <Divider />
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>套餐名称</TableCell>
              <TableCell>开始日期</TableCell>
              <TableCell>结束日期</TableCell>
              <TableCell>上周期订单数</TableCell>
              <TableCell>状态</TableCell>
              <TableCell align="right">申请时间</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subscriptions.map((sub) => (
              <TableRow key={sub.id} hover>
                <TableCell sx={{ fontWeight: "bold" }}>{sub.plan.name}</TableCell>
                <TableCell>{new Date(sub.start_date).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(sub.end_date).toLocaleDateString()}</TableCell>
                <TableCell>{sub.order_count_last_cycle}</TableCell>
                <TableCell>
                  <Chip
                    label={getWordByStatus(sub.status)}
                    color={getColorByStatus(sub.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">{new Date(sub.create_date).toLocaleString()}</TableCell>
              </TableRow>
            ))}
            {subscriptions.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="textSecondary">暂无订阅记录</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </Stack>
  );
}
