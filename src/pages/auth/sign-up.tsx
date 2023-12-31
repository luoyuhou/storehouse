import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Box, Button, Link, Stack, TextField, Typography } from "@mui/material";
import { toast } from "react-toastify";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import { useAuth } from "src/hooks/use-auth";
import { Layout as AuthLayout } from "src/layouts/auth/layout";

function Page() {
  const router = useRouter();
  const auth = useAuth();
  const [verify, setVerify] = useState<boolean>(false);
  const [submitting, seSubmitting] = useState<boolean>(false);
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
      seSubmitting(true);
      try {
        await auth.signUp(values);
        toast.success("创建用户成功");
        router.push("/auth/sign-in");
      } catch (err) {
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: (err as { message: string }).message });
        helpers.setSubmitting(false);
      }
      seSubmitting(false);
    },
  });

  return (
    <>
      <Head>
        <title>Sign-up</title>
      </Head>
      <Box
        sx={{
          flex: "1 1 auto",
          alignItems: "center",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            maxWidth: 550,
            px: 3,
            py: "100px",
            width: "100%",
          }}
        >
          <div>
            <Stack spacing={1} sx={{ mb: 3 }}>
              <Typography variant="h4">注册</Typography>
            </Stack>
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
              <Grid item xs={12} mt={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      value="allowExtraEmails"
                      color="primary"
                      checked={verify}
                      onClick={() => setVerify(!verify)}
                    />
                  }
                  label="我是真人"
                />
              </Grid>
              <Button
                disabled={!verify || submitting}
                fullWidth
                size="large"
                sx={{ mt: 3 }}
                type="submit"
                variant="contained"
              >
                创建
              </Button>
            </form>

            <Grid container justifyContent="flex-end" mt={2}>
              <Grid item>
                <Link href="/auth/sign-in" variant="body2">
                  已注册账号? 登录
                </Link>
              </Grid>
            </Grid>
          </div>
        </Box>
      </Box>
    </>
  );
}

Page.getLayout = (page: React.ReactNode) => <AuthLayout>{page}</AuthLayout>;

export default Page;
