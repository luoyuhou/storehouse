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
  const [submitting, setSubmitting] = useState<boolean>(false);
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
      phone: "",
      password: "",
      confirm_password: "",
      code: "",
      submit: null,
    },
    validationSchema: Yup.object({
      phone: Yup.string().min(11).max(11).required("手机号* 必填"),
      password: Yup.string().min(6, "密码至少6位").max(255).required("密码* 必填"),
      confirm_password: Yup.string()
        .oneOf([Yup.ref("password")], "两次输入的密码不一致")
        .required("确认密码* 必填"),
      code: Yup.string().length(6, "验证码为6位").required("验证码* 必填"),
    }),
    onSubmit: async (values, helpers) => {
      setSubmitting(true);
      try {
        await auth.resetPassword({
          phone: values.phone,
          code: values.code,
          password: values.password,
        });
        toast.success("密码重置成功");
        router.push("/auth/sign-in");
      } catch (err) {
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: (err as { message: string }).message });
        helpers.setSubmitting(false);
      }
      setSubmitting(false);
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
      const res = await auth.getForgetPasswordSmsToken(formik.values.phone);
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
      await auth.sendForgetPasswordSms(formik.values.phone, smsToken);
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
        <title>忘记密码</title>
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
              <Typography variant="h4">忘记密码</Typography>
            </Stack>
            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  error={!!(formik.touched.phone && formik.errors.phone)}
                  fullWidth
                  required
                  helperText={formik.touched.phone && formik.errors.phone}
                  label="手机号"
                  name="phone"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="text"
                  value={formik.values.phone}
                  autoFocus
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
                  label="新密码"
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
                重置密码
              </Button>
            </form>

            <Grid container justifyContent="flex-end" mt={2}>
              <Grid item>
                <Link href="/auth/sign-in" variant="body2">
                  已想起密码? 登录
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
