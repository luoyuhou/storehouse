import React, { useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridEventListener,
  GridRowEditStopReasons,
  GridRowId,
  GridRowModel,
  GridRowModes,
  GridRowModesModel,
  GridRowsProp,
  GridToolbarContainer,
} from "@mui/x-data-grid";
import { Add, Cancel, Delete, Edit, Save } from "@mui/icons-material";
import { get, post } from "src/lib/http";
import { GoodsVersionType, InitialGoodsVersion } from "src/types/goods.type";
import { toast } from "react-toastify";
import { GOODS_UNIT_NAMES, GOODS_VERSION_STATUS_MAP } from "src/constant/goods.const";

interface EditToolbarProps {
  goodsId: string;
  setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
  setRowModesModel: (newModel: (oldModel: GridRowModesModel) => GridRowModesModel) => void;
}

function EditToolbar(props: EditToolbarProps) {
  const { goodsId, setRows, setRowModesModel } = props;

  const handleClick = () => {
    const id = new Date().getTime();
    const initial = InitialGoodsVersion();
    setRows((oldRows) => [...oldRows, { ...initial, id, goods_id: goodsId, isNew: true }]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: "unit_name" },
    }));
  };

  return (
    <GridToolbarContainer>
      <Button color="primary" startIcon={<Add />} onClick={handleClick}>
        Add record
      </Button>
    </GridToolbarContainer>
  );
}

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

  const handleRowEditStop: GridEventListener<"rowEditStop"> = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      // eslint-disable-next-line no-param-reassign
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

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

  const handleDeleteClick = (id: GridRowId) => () => {
    setRows(rows.filter((row: { id: GridRowId }) => row.id !== id));
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row: { id: GridRowId }) => row.id === id);
    if (editedRow!.isNew) {
      setRows(rows.filter((row: { id: GridRowId }) => row.id !== id));
    }
  };

  const processRowUpdate = (newRow: GridRowModel<GoodsVersionType & { isNew?: boolean }>) => {
    const updatedRow = { ...newRow, isNew: false };
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
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
    },
    {
      field: "status",
      headerName: "状态",
      // width: 220,
      editable: true,
      type: "singleSelect",
      valueOptions: GOODS_VERSION_STATUS_MAP,
      cellClassName: "basis-1/8",
    },
    {
      field: "version_number",
      headerName: "生产批次",
      // width: 220,
      editable: true,
      cellClassName: "basis-1/8",
    },
    {
      field: "bar_code",
      headerName: "条形码",
      // width: 220,
      editable: true,
      cellClassName: "basis-1/8",
    },
    {
      field: "supplier",
      headerName: "供应商",
      // width: 220,
      editable: true,
      cellClassName: "basis-1/8",
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      cellClassName: "actions",
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              key={`save-cell-${id}`}
              icon={<Save />}
              label="Save"
              sx={{
                color: "primary.main",
              }}
              disabled={submitting}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              key={`cancel-cell-${id}`}
              icon={<Cancel />}
              label="Cancel"
              className="textPrimary"
              disabled={submitting}
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            key={`edit-cell-${id}`}
            icon={<Edit />}
            label="Edit"
            className="textPrimary"
            disabled={submitting}
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            key={`delete-cell-${id}`}
            icon={<Delete />}
            label="Delete"
            disabled={submitting}
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  return (
    <Box sx={{ flexGrow: 1 }} mt={2}>
      <Typography variant="h6" gutterBottom>
        商品归属
      </Typography>
      <Box
        sx={{
          height: 500,
          width: "100%",
          "& .actions": {
            color: "text.secondary",
          },
          "& .textPrimary": {
            color: "text.primary",
          },
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          editMode="row"
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          onRowEditStop={handleRowEditStop}
          processRowUpdate={processRowUpdate}
          slots={{
            toolbar: EditToolbar,
          }}
          slotProps={{
            toolbar: { setRows, setRowModesModel },
          }}
        />
      </Box>
    </Box>
  );
}
