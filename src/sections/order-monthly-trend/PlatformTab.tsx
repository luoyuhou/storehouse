import { Stack } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { post } from "src/lib/http";
import { MonthlyTrendResponse } from "src/types/order-monthly-trend.type";
import { PlatformSummaryCards } from "./PlatformSummaryCards";
import { PlatformTrendChart } from "./PlatformTrendChart";

function formatMonthInput(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${year}-${month}`;
}

const currentMonth = formatMonthInput(new Date());

export function PlatformTab() {
  const [month, setMonth] = useState<string>(currentMonth);
  const [loading, setLoading] = useState<boolean>(false);
  const [platformTrend, setPlatformTrend] = useState<MonthlyTrendResponse | null>(null);
  const [summary, setSummary] = useState<{
    totalOrders: number;
    totalAmount: number;
  }>({ totalOrders: 0, totalAmount: 0 });

  const onExport = () => {
    if (!platformTrend || !platformTrend.days.length) {
      toast.error("当前没有可导出的平台数据");
      return;
    }

    const rows = platformTrend.days.map((d, index) => ({
      序号: index + 1,
      月份: platformTrend.month,
      日期: d.date,
      商铺ID: "ALL",
      有效订单数: d.totalOrders,
      "订单总金额/分": d.totalAmount,
      "订单总金额/元": (d.totalAmount / 100).toFixed(2),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "平台订单趋势");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const fileName = `平台订单趋势-${platformTrend.month}-ALL.xlsx`;
    saveAs(blob, fileName);
  };

  const fetchPlatformTrend = useCallback(() => {
    if (!month) {
      toast.error("请选择月份");
      return;
    }

    setLoading(true);
    post<MonthlyTrendResponse>({
      url: "/api/store/order/admin/monthly-trend",
      payload: {
        month,
      },
    })
      .then((res) => {
        setPlatformTrend(res);
      })
      .catch((err: { message?: string }) => {
        toast.error(err?.message || "加载平台订单趋势数据失败");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [month]);

  useEffect(() => {
    fetchPlatformTrend();
  }, [fetchPlatformTrend]);

  return (
    <Stack spacing={3}>
      {/* 平台汇总卡片 */}
      <PlatformSummaryCards
        month={month}
        totalOrders={summary.totalOrders}
        totalAmount={summary.totalAmount}
        loading={loading}
        setMonth={setMonth}
        fetchPlatformTrend={fetchPlatformTrend}
      />

      {/* 平台趋势图表 */}
      <PlatformTrendChart trend={platformTrend} onExport={onExport} loading={loading} />
    </Stack>
  );
}
