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
import { GoodsVersionType } from "src/types/goods.type";
import { Box, Button } from "@mui/material";
import { Add, Cancel, Delete, Edit, Save } from "@mui/icons-material";
import React from "react";

interface EditToolbarProps {
  initialEmptyDate: Record<string, never>;
  setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
  setRowModesModel: (newModel: (oldModel: GridRowModesModel) => GridRowModesModel) => void;
}

function EditToolbar(props: EditToolbarProps) {
  const { setRows, setRowModesModel, initialEmptyDate } = props;

  const handleClick = () => {
    const id = new Date().getTime();
    setRows((oldRows) => [...oldRows, { ...initialEmptyDate, id, isNew: true }]);
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

type EditableTableProps = {
  initialEmptyDate: Record<string, string | number | boolean | Date | null>;
  columns: GridColDef[];
  loading: boolean;
  submitting: boolean;
  query: () => void;
};

export function EditableTable(props: EditableTableProps) {
  const { initialEmptyDate, columns, loading, submitting, query } = props;
  const [rows, setRows] = React.useState<(GoodsVersionType & { isNew?: boolean })[]>([]);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});

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
    console.log("id", id);
    const find = rows.find((v) => v.id === id);
    if (!find) {
      // return;
    }
    console.log("rows", rows);
    // todo: query
    query();
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
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

  const actionColumn: GridColDef = {
    field: "actions",
    type: "actions",
    headerName: "Actions",
    minWidth: 100,
    cellClassName: "actions",
    flex: 1,
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
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
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
          loading={loading}
          columns={columns.concat(actionColumn)}
          editMode="row"
          rowModesModel={rowModesModel}
          pagination
          onRowModesModelChange={handleRowModesModelChange}
          onRowEditStop={handleRowEditStop}
          processRowUpdate={processRowUpdate}
          slots={{
            toolbar: EditToolbar,
          }}
          slotProps={{
            toolbar: { setRows, setRowModesModel, initialEmptyDate },
          }}
        />
      </Box>
    </Box>
  );
}
