/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Box, Button } from "@mui/material";
import { Add, Cancel, Delete, Edit, Save } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import { PaginationResponseType } from "src/types/common";

interface EditToolbarProps {
  initialEmptyData: Record<string, never>;
  setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
  setRowModesModel: (newModel: (oldModel: GridRowModesModel) => GridRowModesModel) => void;
}

function EditToolbar(props: EditToolbarProps) {
  const { setRows, setRowModesModel, initialEmptyData } = props;

  const handleClick = () => {
    const id = new Date().getTime();
    setRows((oldRows) => [...oldRows, { ...initialEmptyData, id, isNew: true }]);
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
  initialEmptyData: Record<string, string | number | boolean | Date | null>;
  pagination: PaginationResponseType;
  columns: GridColDef[];
  loading: boolean;
  submitting: boolean;
  onChange: (payload: Record<string, never>) => void;
  onDelete: (id: GridRowId) => void;
};

type RowType = Record<string, never> & { id: number; isNew?: boolean };
export function EditableTable(props: EditableTableProps) {
  const { pagination, initialEmptyData, columns, loading, submitting, onChange, onDelete } = props;
  const [rows, setRows] = React.useState<RowType[]>([]);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});
  const [index, setIndex] = useState<number>(0);

  useEffect(() => {
    if (!pagination?.data) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    setRows(pagination.data);
  }, [pagination.data]);

  useEffect(() => {
    const keys = Object.keys(rowModesModel);
    if (!keys.length) {
      return;
    }

    const key = keys[0];
    if (rowModesModel[key].mode === "view") {
      setIndex(+key);
    }
  }, [rowModesModel]);

  useEffect(() => {
    if (!index) {
      return;
    }

    const item = rows.find((i) => i.id === +index);
    if (!item) {
      return;
    }
    onChange(item);
  }, [rows]);

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
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id: GridRowId) => () => {
    setRows(rows.filter((row: { id: GridRowId }) => row.id !== id));
    onDelete(id);
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

  const processRowUpdate = (newRow: GridRowModel<Record<string, any> & { isNew?: boolean }>) => {
    const updatedRow = { ...newRow, isNew: false };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
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
          rows={rows as any}
          loading={loading}
          columns={columns.concat(actionColumn)}
          editMode="row"
          rowModesModel={rowModesModel}
          pagination
          rowCount={pagination?.pages}
          onRowModesModelChange={handleRowModesModelChange}
          onRowEditStop={handleRowEditStop}
          processRowUpdate={processRowUpdate}
          slots={{
            toolbar: EditToolbar,
          }}
          slotProps={{
            toolbar: { setRows, setRowModesModel, initialEmptyData },
          }}
        />
      </Box>
    </Box>
  );
}
