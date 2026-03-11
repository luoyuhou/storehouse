import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Box, Button, Link, Stack, TextField, Typography } from "@mui/material";
import { toast } from "react-toastify";
import Grid from "@mui/material/Grid";
import { useAuth } from "src/hooks/use-auth";
import { Layout as AuthLayout } from "src/layouts/auth/layout";
import { SliderCaptcha } from "src/components/slider-captcha";

function Page() {
  const router = useRouter();
  const auth = useAuth();
  const [verify, setVerify] = useState<boolean>(false);
  const [smsToken, setSmsToken] = useState<string>("");
  const [resetSlider, setResetSlider] = useState<boolean>(false);
  const [submitting, seSubmitting] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formik = useFormik({
    initialValues: {
      first_name: "",
      last_name: "",
      phone: "",
      password: "",
      confirm_password: "",
      code: "",
      submit: null,
    },
    validationSchema: Yup.object({
      last_name: Yup.string().max(16).required("姓* 必填"),
      first_name: Yup.string().max(16).required("名* 必填"),
      phone: Yup.string().min(11).max(11).required("电话* 必填"),
      password: Yup.string().max(255).required("密码* 必填"),
      confirm_password: Yup.string()
        .oneOf([Yup.ref("password")], "两次输入的密码不一致")
        .required("确认密码* 必填"),
      code: Yup.string().length(6, "验证码为6位").required("验证码* 必填"),
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

  const handleSliderSuccess = async () => {
    if (!formik.values.phone || formik.errors.phone) {
      toast.error("请先输入正确的手机号");
      setResetSlider(true);
      setTimeout(() => setResetSlider(false), 100);
      return;
    }
    try {
      const res = await auth.getSmsToken(formik.values.phone);
      setSmsToken(res.token);
      setVerify(true);
    } catch (err) {
      toast.error((err as { message: string }).message || "获取验证 Token 失败");
      setResetSlider(true);
      setTimeout(() => setResetSlider(false), 100);
    }
  };

  const handleSendSms = async () => {
    if (!formik.values.phone || formik.errors.phone) {
      toast.error("请输入正确的手机号");
      return;
    }
    if (!smsToken) {
      toast.error("请先完成滑块验证");
      return;
    }
    try {
      await auth.sendSmsCode(formik.values.phone, smsToken);
      toast.success("验证码已发送");
      startCountdown();
    } catch (err) {
      toast.error((err as { message: string }).message || "发送失败");
      // 发送失败后重置验证状态，要求重新滑动
      setVerify(false);
      setSmsToken("");
      setResetSlider(true);
      setTimeout(() => setResetSlider(false), 100);
    }
  };

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
                <Grid item xs={12} mt={2}>
                  <SliderCaptcha onSuccess={handleSliderSuccess} reset={resetSlider} />
                </Grid>
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <TextField
                    error={!!(formik.touched.code && formik.errors.code)}
                    fullWidth
                    required
                    helperText={formik.touched.code && formik.errors.code}
                    label="短信验证码"
                    name="code"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    type="text"
                    value={formik.values.code}
                  />
                  <Button
                    variant="outlined"
                    disabled={countdown > 0 || !verify}
                    onClick={handleSendSms}
                    sx={{ height: 56, minWidth: 120 }}
                  >
                    {countdown > 0 ? `${countdown}s` : "获取验证码"}
                  </Button>
                </Stack>
                <TextField
                  error={!!(formik.touched.password && formik.errors.password)}
                  fullWidth
                  required
                  helperText={formik.touched.password && formik.errors.password}
                  label="密码"
                  name="password"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="password"
                  value={formik.values.password}
                />
                <TextField
                  error={!!(formik.touched.confirm_password && formik.errors.confirm_password)}
                  fullWidth
                  required
                  helperText={formik.touched.confirm_password && formik.errors.confirm_password}
                  label="确认密码"
                  name="confirm_password"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="password"
                  value={formik.values.confirm_password}
                />
              </Stack>
              {formik.errors.submit && (
                <Typography color="error" sx={{ mt: 3 }} variant="body2">
                  {formik.errors.submit}
                </Typography>
              )}
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
