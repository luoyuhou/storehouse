import { Button, Stack, TextField } from "@mui/material";
import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";

export function CategoryAdd({ pid }: { pid: string }) {
  const [isAdd, setIsAdd] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const formik = useFormik({
    children: undefined,
    component: undefined,
    initialErrors: undefined,
    initialTouched: undefined,
    initialValues: {
      pid,
      name: "",
      submit: null,
    },
    innerRef: undefined,
    isInitialValid: undefined,
    validationSchema: Yup.object({
      phone: Yup.string().min(11).max(11).required("电话* 必填"),
      password: Yup.string().max(255).required("密码* 必填"),
    }),
    onSubmit: async (values, helpers) => {
      setSubmitting(true);
    },
  });

  if (!isAdd) {
    return (
      <Stack>
        <Button fullWidth onClick={() => setIsAdd(true)}>
          Create
        </Button>
      </Stack>
    );
  }

  return (
    <form noValidate onSubmit={formik.handleSubmit}>
      <Stack spacing={3}>
        <TextField
          margin="normal"
          error={!!(formik.touched.name && formik.errors.name)}
          fullWidth
          helperText={formik.touched.name && formik.errors.name}
          label="分类"
          name="name"
          onBlur={(e) => {
            if (!e.target.value.trim()) {
              setIsAdd(false);
              return;
            }
            formik.handleBlur(e);
          }}
          onChange={formik.handleChange}
          type="text"
          value={formik.values.name}
          required
          autoFocus
        />
      </Stack>
    </form>
  );
}
