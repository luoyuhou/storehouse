import React, { useCallback, useEffect, useState } from "react";
import { Stack } from "@mui/material";
import { StoreSelector } from "src/components/store/store-selector";
import { toast } from "react-toastify";
import { post } from "src/lib/http";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { MonthlyTrendResponse } from "src/types/order-monthly-trend.type";
import { MonthSelector } from "./MonthSelector";
import { RefreshButton } from "./RefreshButton";
import { StoreTrendChart } from "./StoreTrendChart";

function formatMonthInput(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${year}-${month}`;
}

const currentMonth = formatMonthInput(new Date());

export function StoreTab() {
  const [month, setMonth] = useState<string>(currentMonth);
  const [storeId, setStoreId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [storeTrend, setStoreTrend] = useState<MonthlyTrendResponse | null>(null);

  const fetchStoreTrend = useCallback(() => {
    if (!month) {
      toast.error("请选择月份");
      return;
    }
    if (!storeId) {
      setStoreTrend(null);
      return;
    }

    setLoading(true);
    post<MonthlyTrendResponse>({
      url: "/api/store/order/admin/monthly-trend",
      payload: {
        month,
        store_id: storeId,
      },
    })
      .then((res) => {
        setStoreTrend(res);
      })
      .catch((err: { error?: string }) => {
        toast.error(err?.error || "加载指定商家订单趋势数据失败");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [month, storeId]);

  const handleExportStoreExcel = () => {
    if (!storeId) {
      toast.error("请先选择一个商家");
      return;
    }
    if (!storeTrend || !storeTrend.days.length) {
      toast.error("当前商家没有可导出的数据");
      return;
    }

    const rows = storeTrend.days.map((d, index) => ({
      序号: index + 1,
      月份: storeTrend.month,
      日期: d.date,
      商铺ID: storeId,
      有效订单数: d.totalOrders,
      "订单总金额/分": d.totalAmount,
      "订单总金额/元": (d.totalAmount / 100).toFixed(2),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "商家订单趋势");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const fileName = `商家订单趋势-${storeTrend.month}-${storeId}.xlsx`;
    saveAs(blob, fileName);
  };

  useEffect(() => {
    fetchStoreTrend();
  }, [fetchStoreTrend]);

  return (
    <Stack spacing={3}>
      {/* 商家选择器和导出按钮 */}
      <Stack direction="row" spacing={2} justifyContent="space-between">
        <StoreSelector
          label="指定商家（按名称搜索）"
          onChange={(val?: string) => setStoreId(val ?? "")}
        />

        {/* 商家标签页内部的月份选择器和刷新按钮 */}
        <Stack direction="row" spacing={2} alignItems="center">
          <MonthSelector month={month} onChange={setMonth} disabled={loading} />
          <RefreshButton
            onClick={fetchStoreTrend}
            loading={loading}
            disabled={!month}
            label="刷新"
          />
        </Stack>
      </Stack>

      {/* 商家趋势图表 */}
      <StoreTrendChart
        trend={storeTrend}
        storeId={storeId}
        onExport={handleExportStoreExcel}
        loading={loading}
      />
    </Stack>
  );
}
