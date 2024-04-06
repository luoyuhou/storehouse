import React from "react";
import { Box, Button, SvgIcon, Typography } from "@mui/material";
import { PlayIcon } from "@heroicons/react/20/solid";
import { ParseJsonComponent } from "src/sections/tools/parse-json.component";
import { DataGrid, GridToolbar, GridColDef } from "@mui/x-data-grid";
import { toast } from "react-toastify";
import { GOODS_UNIT_NAMES } from "src/constant/goods.const";

const getKeys = (keys: string[], data: Record<string, never>) => {
  const copyKeys = [...keys];
  const innerKeys = Object.keys(data);
  innerKeys.forEach((k) => {
    if (copyKeys.includes(k)) {
      return;
    }
    copyKeys.push(k);
  });

  return copyKeys;
};

const getColumns = (keys: string[]) => {
  if (!keys.length) {
    return [];
  }

  return keys.map((k) => ({
    field: k,
    headerName: k,
    valueOptions: GOODS_UNIT_NAMES,
    cellClassName: "basis-1/8",
    flex: 1,
  }));
};

export default function JsonToCsvPanel() {
  const [value, setValue] = React.useState<Record<string, never> | Record<string, never>[]>([]);
  const [rows, setRows] = React.useState<Record<string, string>[]>([]);
  const [columns, setColumns] = React.useState<GridColDef[]>([]);

  const onFormat = () => {
    if (!value) {
      toast.warn("内容不能为空");
      return;
    }

    try {
      if (Array.isArray(value)) {
        if (!value.length) {
          setRows([]);
          setColumns([]);
          return;
        }

        const arr: Record<string, string>[] = [];
        let keys: string[] = [];
        value.forEach((obj: Record<string, never>) => {
          keys = getKeys(keys, obj);

          const newObj: Record<string, string> = {};
          Object.keys(obj).forEach((k) => {
            const v = obj[k];
            newObj[k] = v && (Array.isArray(v) || typeof v === "object") ? JSON.stringify(v) : v;
          });
          arr.push(newObj);
        });

        setColumns(getColumns(keys));

        setRows(arr);
      }
    } catch (err) {
      toast.error(
        `数据解析错误，数据仅为 array 和 object，请查证后重试。 Error: ${(err as { message: string })?.message}`,
      );
    }
  };

  return (
    <Box sx={{ px: 2 }}>
      <ParseJsonComponent setValue={setValue} />

      {value?.length ? <hr /> : null}

      {value?.length ? (
        <Box>
          <Typography align="center" color="primary" variant="h6" mb={2}>
            <Button variant="contained" color="primary" onClick={() => onFormat()}>
              <SvgIcon fontSize="small">
                <PlayIcon />
              </SvgIcon>
              &nbsp;生成 Table
            </Button>
          </Typography>

          <DataGrid
            rows={rows}
            columns={columns}
            pagination
            rowCount={rows.length}
            slots={{ toolbar: GridToolbar }}
          />
        </Box>
      ) : null}
    </Box>
  );
}
