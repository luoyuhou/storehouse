import { FormControl, InputLabel, Select, TableCell, TableRow, TextField } from "@mui/material";
import React from "react";
import {
  TableHeaderFilterInputProps,
  TableHeaderFilterSelectProps,
} from "src/components/filter/filter.type";
import { useFormik } from "formik";

export function TableHeaderFilter({
  filters,
  onFetch,
  actionPosition,
}: {
  filters: (TableHeaderFilterInputProps | TableHeaderFilterSelectProps)[];
  onFetch: (arg: Record<string, never>) => void;
  actionPosition: "start" | "end";
}) {
  const initialObj: Record<string, string> = {};
  filters.forEach(({ name }) => {
    initialObj[name] = "";
  });
  const formik = useFormik({
    initialValues: {
      ...initialObj,
      submit: null,
    },
    onSubmit: async ({ submit, ...values }) => {
      onFetch(values);
    },
  });

  return (
    <TableRow>
      <form noValidate onSubmit={formik.handleSubmit}>
        {actionPosition === "start" && (
          <TableCell>
            <button type="submit">查询</button>
          </TableCell>
        )}
        {filters.map((item) => {
          if (item.type === "input") {
            return (
              <TableCell key={item.name}>
                <TextField
                  fullWidth
                  label={item.label}
                  name={item.name}
                  type="text"
                  onChange={formik.handleChange}
                  value={(formik.values as unknown as { [key: string]: string })[item.name]}
                />
              </TableCell>
            );
          }
          return (
            <TableCell key={item.name}>
              <FormControl variant="filled" fullWidth>
                <InputLabel htmlFor="filled-age-native-simple">{item.label}</InputLabel>
                <Select
                  native
                  displayEmpty
                  value={(formik.values as unknown as { [key: string]: string })[item.name]}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  name={item.name}
                  id={item.name}
                >
                  <option aria-label="None" value="" />
                  {item.options.map(({ label, value }) => (
                    <option key={`province-${label}`} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </TableCell>
          );
        })}
        {actionPosition === "end" && (
          <TableCell>
            <button type="submit">查询</button>
          </TableCell>
        )}
      </form>
    </TableRow>
  );
}
