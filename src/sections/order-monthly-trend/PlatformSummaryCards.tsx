import React from "react";
import { Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import { MonthSelector } from "./MonthSelector";
import { RefreshButton } from "./RefreshButton";

export interface PlatformSummaryCardsProps {
  month: string;
  totalOrders: number;
  totalAmount: number; // 分

  loading: boolean;
  setMonth: (month: string) => void;
  fetchPlatformTrend: () => void;
}

export function PlatformSummaryCards({
  month,
  totalOrders,
  totalAmount,
  loading,
  setMonth,
  fetchPlatformTrend,
}: PlatformSummaryCardsProps) {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={4} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom variant="overline">
              月份
            </Typography>
            <Typography variant="h5">{month}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={4} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom variant="overline">
              有效订单总数
            </Typography>
            <Typography variant="h4">{totalOrders}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={4} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom variant="overline">
              订单总金额
            </Typography>
            <Typography variant="h4">¥{(totalAmount / 100).toFixed(2)}</Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* 平台标签页内部的月份选择器和刷新按钮 */}
      <Grid item xs={12} sm={4} md={3}>
        <Stack direction="row" spacing={2} alignItems="center">
          <MonthSelector month={month} onChange={setMonth} disabled={loading} />
          <RefreshButton
            onClick={fetchPlatformTrend}
            loading={loading}
            disabled={!month}
            label="刷新"
          />
        </Stack>
      </Grid>
    </Grid>
  );
}
