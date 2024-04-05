import React, { useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { get, post } from "src/lib/http";
import { GoodsVersionType, InitialGoodsVersion } from "src/types/goods.type";
import { toast } from "react-toastify";
import { GOODS_UNIT_NAMES, GOODS_VERSION_STATUS_MAP } from "src/constant/goods.const";
import { EditableTable } from "src/components/table/editable.table";
import { PaginationResponseType } from "src/types/common";

export function GoodsVersionsEditing({ id: goodsId }: { id: string }) {
  const [loading, setLoading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [pagination, setPagination] = React.useState<PaginationResponseType>({
    pages: 0,
    rows: 0,
    data: [],
  });

  const pageSize = 10;

  useEffect(() => {
    const trimmed = (goodsId ?? "").trim();
    if (!trimmed) {
      return;
    }
    setLoading(true);
    get<{ data: GoodsVersionType[] }>(`/api/store/goods/version/${trimmed}`)
      .then(({ data }) => {
        setPagination({ rows: data.length, pages: Math.ceil(data.length / pageSize), data });
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [goodsId]);

  const handleSaveClick = async (payload: GoodsVersionType) => {
    setSubmitting(true);
    const formattedPayload = {
      ...payload,
      count: Number(payload.count),
      price: payload.price * 100,
      bar_code: payload.bar_code ?? undefined,
      supplier: payload.supplier ?? undefined,
    };
    return post({ url: `/api/store/goods/version/${goodsId}`, payload: formattedPayload })
      .then(() => {
        toast.success(`更新版本信息成功`);
        return true;
      })
      .catch((err) => {
        toast.error(JSON.stringify(err.message));
        return false;
      })
      .finally(() => setSubmitting(false));
  };

  const columns: GridColDef[] = [
    {
      field: "unit_name",
      headerName: "单位",
      // width: 180,
      editable: true,
      type: "singleSelect",
      valueOptions: GOODS_UNIT_NAMES,
      cellClassName: "basis-1/8",
      flex: 1,
    },
    {
      field: "price",
      headerName: "价格/元",
      type: "number",
      // width: 80,
      align: "left",
      headerAlign: "left",
      editable: true,
      cellClassName: "basis-1/8",
      flex: 1,
      renderCell: ({ row: { price } }) => {
        return <span>{((price ?? 0) / 100).toFixed(2)}</span>;
      },
    },
    {
      field: "count",
      headerName: "数量",
      // type: "date",
      // width: 180,
      editable: true,
      cellClassName: "basis-1/8",
      flex: 1,
    },
    {
      field: "status",
      headerName: "状态",
      // width: 220,
      editable: true,
      type: "singleSelect",
      valueOptions: GOODS_VERSION_STATUS_MAP,
      cellClassName: "basis-1/8",
      flex: 1,
    },
    {
      field: "version_number",
      headerName: "生产批次",
      // width: 220,
      editable: true,
      cellClassName: "basis-1/8",
      flex: 1,
    },
    {
      field: "bar_code",
      headerName: "条形码",
      // width: 220,
      editable: true,
      cellClassName: "basis-1/8",
      flex: 1,
    },
    {
      field: "supplier",
      headerName: "供应商",
      // width: 220,
      editable: true,
      cellClassName: "basis-1/8",
      flex: 1,
    },
  ];

  return (
    <Box sx={{ flexGrow: 1 }} mt={2}>
      <Typography variant="h6" gutterBottom>
        商品版本
      </Typography>
      <EditableTable
        pagination={pagination}
        initialEmptyData={InitialGoodsVersion({ goods_id: goodsId })}
        columns={columns}
        loading={loading}
        submitting={submitting}
        onChange={(payload) => handleSaveClick(payload as unknown as GoodsVersionType)}
        onDelete={() => {}}
      />
    </Box>
  );
}
