import { Button, Stack, TextField, Typography } from "@mui/material";
import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { post } from "src/lib/http";

export function CategoryAdd({
  storeId,
  pid,
  setTrigger,
}: {
  storeId: string;
  pid?: string;
  setTrigger: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [isAdd, setIsAdd] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const formik = useFormik({
    children: undefined,
    component: undefined,
    initialErrors: undefined,
    initialTouched: undefined,
    initialValues: {
      name: "",
      submit: null,
    },
    innerRef: undefined,
    isInitialValid: undefined,
    validationSchema: Yup.object({
      name: Yup.string().min(2).max(16).required("名称* 必填"),
    }),
    onSubmit: async (values, helpers) => {
      setSubmitting(true);
      post({
        url: "/api/store/category",
        payload: { store_id: storeId, pid: pid ?? undefined, name: values.name },
      })
        .then(() => {
          toast.success(`创建 ${values.name} 成功`);
          setTrigger((c) => c + 1);
          helpers.setValues({ name: "", submit: null });
          setIsAdd(false);
        })
        .catch((err) => {
          helpers.setStatus({ success: false });
          helpers.setErrors({ submit: (err as { message: string }).message });
          helpers.setSubmitting(false);
        })
        .finally(() => setSubmitting(false));
    },
  });

  if (!isAdd) {
    return (
      <Stack>
        <Button fullWidth onClick={() => setIsAdd(true)}>
          创建
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
          disabled={submitting}
          autoFocus
        />
      </Stack>
      {formik.errors.submit && (
        <Typography color="error" sx={{ mt: 3 }} variant="body2">
          {formik.errors.submit}
        </Typography>
      )}
      <Button
        fullWidth
        size="large"
        sx={{ mt: 3 }}
        type="submit"
        variant="contained"
        disabled={!formik.values.name || submitting}
      >
        创建
      </Button>
    </form>
  );
}
