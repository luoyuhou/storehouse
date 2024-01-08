import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import React, { useState } from "react";
import Head from "next/head";
import {
  Box,
  Button,
  Container,
  Link,
  Stack,
  TextField,
  Typography,
  Unstable_Grid2 as Grid,
} from "@mui/material";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";

function ApplyStore() {
  const [submitting, setSubmitting] = useState(false);
  const formik = useFormik({
    initialValues: {
      first_name: "",
      last_name: "",
      phone: "",
      password: "",
      submit: null,
    },
    validationSchema: Yup.object({
      last_name: Yup.string().max(16).required("姓* 必填"),
      first_name: Yup.string().max(16).required("名* 必填"),
      phone: Yup.string().min(11).max(11).required("电话* 必填"),
      password: Yup.string().max(255).required("密码* 必填"),
    }),
    onSubmit: async (values, helpers) => {
      setSubmitting(true);
      try {
        // await auth.signUp(values);
        toast.success("创建用户成功");
        // router.push("/auth/sign-in");
      } catch (err) {
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: (err as { message: string }).message });
        helpers.setSubmitting(false);
      }
      setSubmitting(false);
    },
  });

  return (
    <>
      <Head>
        <title>商铺申请</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={3}>
            <div>
              <Typography variant="h4">商铺申请</Typography>
            </div>
            <div>
              <form noValidate onSubmit={formik.handleSubmit}>
                <Stack spacing={3}>
                  <TextField
                    error={!!(formik.touched.last_name && formik.errors.last_name)}
                    fullWidth
                    required
                    helperText={formik.touched.last_name && formik.errors.last_name}
                    label="姓"
                    name="last_name"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.last_name}
                    autoFocus
                  />
                  <TextField
                    error={!!(formik.touched.first_name && formik.errors.first_name)}
                    fullWidth
                    required
                    helperText={formik.touched.first_name && formik.errors.first_name}
                    label="名"
                    name="first_name"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    type="text"
                    value={formik.values.first_name}
                  />
                  <TextField
                    error={!!(formik.touched.phone && formik.errors.phone)}
                    fullWidth
                    required
                    helperText={formik.touched.phone && formik.errors.phone}
                    label="手机"
                    name="phone"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    type="text"
                    value={formik.values.phone}
                  />
                  <TextField
                    error={!!(formik.touched.password && formik.errors.password)}
                    fullWidth
                    required
                    helperText={formik.touched.password && formik.errors.password}
                    label="Password"
                    name="password"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    type="password"
                    value={formik.values.password}
                  />
                </Stack>
                {formik.errors.submit && (
                  <Typography color="error" sx={{ mt: 3 }} variant="body2">
                    {formik.errors.submit}
                  </Typography>
                )}
                <Button
                  disabled={submitting}
                  fullWidth
                  size="large"
                  sx={{ mt: 3 }}
                  type="submit"
                  variant="contained"
                >
                  创建
                </Button>
              </form>
            </div>
          </Stack>
        </Container>
      </Box>
    </>
  );
}

ApplyStore.getLayout = (page: JSX.Element) => <DashboardLayout>{page}</DashboardLayout>;

export default ApplyStore;
