import React, { useCallback, useState } from "react";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { FormikErrors, FormikHelpers, FormikProps, useFormik } from "formik";
import * as Yup from "yup";
import { Box, Button, Link, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks/use-auth";
import { Layout as AuthLayout } from "@/layouts/auth/layout";
import LoggedIn from "@/hooks/logged-in";

function Page() {
  const router = useRouter();
  LoggedIn(router);
  const auth = useAuth();
  const [method, setMethod] = useState("phone");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const formik = useFormik({
    children: undefined,
    component: undefined,
    initialErrors: undefined,
    initialTouched: undefined,
    initialValues: {
      phone: "",
      password: "",
      submit: null,
    },
    innerRef: undefined,
    isInitialValid: undefined,
    onReset<Values>(values: Values, formikHelpers: FormikHelpers<Values>): void {},
    render<Values>(props: FormikProps<Values>): React.ReactNode {
      return undefined;
    },
    validate<Values>(values: Values): void | object | Promise<FormikErrors<Values>> {
      return undefined;
    },
    validationSchema: Yup.object({
      phone: Yup.string().min(11).max(11).required("电话* 必填"),
      password: Yup.string().max(255).required("密码* 必填"),
    }),
    onSubmit: async (values, helpers) => {
      setSubmitting(true);
      auth
        .signIn(values.phone, values.password)
        .then(() => {
          toast.success("登陆成功");
          router.push("/");
        })
        .catch((err) => {
          helpers.setStatus({ success: false });
          helpers.setErrors({ submit: (err as { message: string }).message });
          helpers.setSubmitting(false);
        })
        .finally(() => setSubmitting(false));
    },
  });

  const handleMethodChange = useCallback(
    (event: React.SyntheticEvent, value: React.SetStateAction<string>) => {
      setMethod(value);
    },
    [],
  );

  return (
    <>
      <Head>
        <title>Sign-in</title>
      </Head>
      <Box
        sx={{
          backgroundColor: "background.paper",
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
              <Typography variant="h4">登录</Typography>
              <Typography color="text.secondary" variant="body2">
                未注册账号?
                <Link
                  sx={{ ml: 2 }}
                  component={NextLink}
                  href="/auth/sign-up"
                  underline="hover"
                  variant="subtitle2"
                >
                  注册
                </Link>
              </Typography>
            </Stack>
            <Tabs onChange={handleMethodChange} sx={{ mb: 3 }} value={method}>
              <Tab label="手机登录" value="phone" />
              <Tab label="扫码登录" value="scarCode" />
            </Tabs>
            {method === "phone" && (
              <>
                <form noValidate onSubmit={formik.handleSubmit}>
                  <Stack spacing={3}>
                    <TextField
                      margin="normal"
                      error={!!(formik.touched.phone && formik.errors.phone)}
                      fullWidth
                      helperText={formik.touched.phone && formik.errors.phone}
                      label="手机"
                      name="phone"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      type="text"
                      value={formik.values.phone}
                      autoComplete="phone"
                      autoFocus
                      required
                    />
                    <TextField
                      margin="normal"
                      error={!!(formik.touched.password && formik.errors.password)}
                      fullWidth
                      helperText={formik.touched.password && formik.errors.password}
                      label="密码"
                      name="password"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      type="password"
                      value={formik.values.password}
                    />
                  </Stack>
                  {/* <FormHelperText sx={{ mt: 1 }}>Optionally you can skip.</FormHelperText> */}
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
                    登录
                  </Button>
                  {/* <Alert color="primary" severity="info" sx={{ mt: 3 }}> */}
                  {/*  <div> */}
                  {/*    You can use <b>demo@devias.io</b> and password <b>Password123!</b> */}
                  {/*  </div> */}
                  {/* </Alert> */}
                </form>
                <Grid container mt={2} style={{ justifyContent: "end" }}>
                  <Grid item>
                    <Link component={NextLink} href="/auth/forget-password" variant="body2">
                      忘记密码?
                    </Link>
                  </Grid>
                </Grid>
              </>
            )}
            {method === "phoneNumber" && (
              <div>
                <Typography sx={{ mb: 1 }} variant="h6">
                  Not available in the demo
                </Typography>
                <Typography color="text.secondary">
                  To prevent unnecessary costs we disabled this feature in the demo.
                </Typography>
              </div>
            )}
          </div>
        </Box>
      </Box>
    </>
  );
}

Page.getLayout = (page: React.ReactNode) => <AuthLayout>{page}</AuthLayout>;

export default Page;
