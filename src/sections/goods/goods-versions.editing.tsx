import React, { useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import { GridColDef, GridRowId, GridRowModes, GridRowModesModel } from "@mui/x-data-grid";
import { get, post } from "src/lib/http";
import { GoodsVersionType, InitialGoodsVersion } from "src/types/goods.type";
import { toast } from "react-toastify";
import { GOODS_UNIT_NAMES, GOODS_VERSION_STATUS_MAP } from "src/constant/goods.const";
import { EditableTable } from "src/components/table/editable.table";

export function GoodsVersionsEditing({ id: goodsId }: { id: string }) {
  const [loading, setLoading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [rows, setRows] = React.useState<(GoodsVersionType & { isNew?: boolean })[]>([]);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});

  useEffect(() => {
    const trimmed = (goodsId ?? "").trim();
    if (!trimmed) {
      return;
    }
    setLoading(true);
    get<{ data: GoodsVersionType[] }>(`/api/store/goods/version/${trimmed}`)
      .then(({ data }) => setRows(data))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [goodsId]);

  const handleSaveClick = (id: GridRowId) => () => {
    const find = rows.find((v) => v.id === id);
    if (!find) {
      return;
    }
    const payload = {
      version_id: find.version_id,
      version_number: find.version_number ? find.version_number : undefined,
      bar_code: find.bar_code ? find.bar_code : undefined,
      count: find.count,
      price: find.price,
      unit_name: find.unit_name,
      supplier: find.supplier ? find.supplier : undefined,
      status: find.status,
    };
    setSubmitting(true);
    post({ url: `/api/store/goods/version/${goodsId}`, payload })
      .then(() => {
        toast.success(`更新版本信息成功`);
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
      })
      .catch((err) => toast.error(JSON.stringify(err.message)))
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
        商品归属
      </Typography>
      <EditableTable
        pagination={{ pages: 0, rows: 0, data: [] }}
        initialEmptyData={InitialGoodsVersion()}
        columns={columns}
        loading={loading}
        submitting={submitting}
        onChange={() => {}}
        onDelete={() => {}}
      />
    </Box>
  );
}
