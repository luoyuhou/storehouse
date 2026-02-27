import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import React, { useEffect } from "react";
import Head from "next/head";
import {
  Box,
  Container,
  Stack,
  Typography,
  Unstable_Grid2 as Grid,
  Paper,
  MobileStepper,
  Button,
  CardContent,
  Avatar,
  Divider,
  CardActions,
  Card,
} from "@mui/material";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { get, patch, post } from "src/lib/http";
import { toast } from "react-toastify";
import CircularPercentageLoading from "src/components/loading/circular-percentage.loading";
import { CompanyProfileDetails } from "src/sections/companies/company-profile-details";
import { StoreType } from "src/types/store.type";
import { CompanyStatus } from "src/sections/companies/company-status";

function Store() {
  const [listLoading, setListLoading] = React.useState(false);
  const [stores, setStores] = React.useState<StoreType[]>([]);
  const [activeStep, setActiveStep] = React.useState(0);
  const [uploadingWechat, setUploadingWechat] = React.useState(false);
  const [uploadingAlipay, setUploadingAlipay] = React.useState(false);

  useEffect(() => {
    setListLoading(true);
    get<{ data: StoreType[] }>("/api/store")
      .then((res) => setStores(res.data))
      .catch((err) => toast.error(err.message))
      .finally(() => setListLoading(false));
  }, []);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleUploadQr =
    (type: "wechat" | "alipay") => async (event: React.ChangeEvent<HTMLInputElement>) => {
      const currentStore = stores[activeStep];
      const file = event.target.files?.[0];
      if (!currentStore || !file) return;

      if (file.size > 5 * 1024 * 1024) {
        toast.error("图片大小不能超过5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("请选择图片文件");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      if (type === "wechat") setUploadingWechat(true);
      if (type === "alipay") setUploadingAlipay(true);

      try {
        const { url } = (await post<{ url: string }>({
          url: "/api/file/upload",
          payload: formData,
          config: { isFile: true },
        })) as { url: string };

        await patch({
          url: `/api/store/${currentStore.store_id}/qr`,
          payload: {
            wechat_qr_url: type === "wechat" ? url : undefined,
            alipay_qr_url: type === "alipay" ? url : undefined,
          },
        });

        setStores((prev) => {
          const next = [...prev];
          next[activeStep] = {
            ...next[activeStep],
            wechat_qr_url: type === "wechat" ? url : next[activeStep].wechat_qr_url,
            alipay_qr_url: type === "alipay" ? url : next[activeStep].alipay_qr_url,
          };
          return next;
        });

        toast.success(`${type === "wechat" ? "微信" : "支付宝"}收款码已更新`);
      } catch (err) {
        toast.error((err as { message?: string })?.message || "上传收款码失败");
      } finally {
        if (type === "wechat") setUploadingWechat(false);
        if (type === "alipay") setUploadingAlipay(false);
        // eslint-disable-next-line no-param-reassign
        event.target.value = "";
      }
    };

  return (
    <>
      <Head>
        <title>Store List</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 3,
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={3}>
            <div>
              <Typography variant="h4">我的商店</Typography>
            </div>
            <Box sx={{ flexGrow: 1 }}>
              <CircularPercentageLoading loading={listLoading}>
                <Grid container spacing={3}>
                  <Grid xs={12} md={6} lg={4}>
                    {stores[activeStep] && (
                      <Card>
                        <CardContent>
                          <Box
                            sx={{
                              alignItems: "center",
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            <Avatar
                              src={stores[activeStep].logo}
                              sx={{
                                height: 80,
                                mb: 2,
                                width: 80,
                                fontSize: "24px",
                              }}
                            >
                              {stores[activeStep].store_name.slice(0, 2)}
                            </Avatar>
                            <Typography gutterBottom variant="h5">
                              {stores[activeStep].store_name}
                            </Typography>
                            <CompanyStatus status={stores[activeStep].status} />
                            <Typography color="text.secondary" variant="body2">
                              商家: {stores[activeStep].id_name}
                            </Typography>
                            <Typography color="text.secondary" variant="body2">
                              身份证号码: {stores[activeStep].id_code}
                            </Typography>
                            <Typography color="text.secondary" variant="body2">
                              电话: {stores[activeStep].phone}
                            </Typography>
                          </Box>
                        </CardContent>
                        <Divider />
                        <CardActions
                          sx={{ flexDirection: "column", alignItems: "stretch", gap: 1 }}
                        >
                          <Button fullWidth variant="text">
                            更换商铺 Logo
                          </Button>
                          <Box sx={{ width: "100%", mt: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              收款码设置
                            </Typography>
                            <Stack direction="row" spacing={2}>
                              <Box
                                component="label"
                                sx={{
                                  flex: 1,
                                  border: "1px dashed",
                                  borderColor: "grey.300",
                                  borderRadius: 1,
                                  p: 1,
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  "&:hover": {
                                    borderColor: "primary.main",
                                  },
                                }}
                              >
                                <input
                                  type="file"
                                  hidden
                                  accept="image/*"
                                  onChange={handleUploadQr("wechat")}
                                />
                                <CloudUploadIcon
                                  sx={{ fontSize: 28, color: "text.secondary", mb: 0.5 }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {uploadingWechat ? "微信收款码上传中..." : "微信收款码"}
                                </Typography>
                                {stores[activeStep].wechat_qr_url && (
                                  <Box
                                    component="img"
                                    src={stores[activeStep].wechat_qr_url as string}
                                    alt="微信收款码"
                                    sx={{
                                      mt: 1,
                                      width: 72,
                                      height: 72,
                                      objectFit: "contain",
                                      borderRadius: 1,
                                    }}
                                  />
                                )}
                              </Box>
                              <Box
                                component="label"
                                sx={{
                                  flex: 1,
                                  border: "1px dashed",
                                  borderColor: "grey.300",
                                  borderRadius: 1,
                                  p: 1,
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  "&:hover": {
                                    borderColor: "primary.main",
                                  },
                                }}
                              >
                                <input
                                  type="file"
                                  hidden
                                  accept="image/*"
                                  onChange={handleUploadQr("alipay")}
                                />
                                <CloudUploadIcon
                                  sx={{ fontSize: 28, color: "text.secondary", mb: 0.5 }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {uploadingAlipay ? "支付宝收款码上传中..." : "支付宝收款码"}
                                </Typography>
                                {stores[activeStep].alipay_qr_url && (
                                  <Box
                                    component="img"
                                    src={stores[activeStep].alipay_qr_url as string}
                                    alt="支付宝收款码"
                                    sx={{
                                      mt: 1,
                                      width: 72,
                                      height: 72,
                                      objectFit: "contain",
                                      borderRadius: 1,
                                    }}
                                  />
                                )}
                              </Box>
                            </Stack>
                          </Box>
                        </CardActions>
                      </Card>
                    )}
                  </Grid>
                  <Grid xs={12} md={6} lg={8}>
                    {stores[activeStep] && <CompanyProfileDetails company={stores[activeStep]} />}
                  </Grid>
                </Grid>
                <MobileStepper
                  steps={stores.length}
                  position="static"
                  variant="text"
                  activeStep={activeStep}
                  nextButton={
                    <Button
                      size="small"
                      onClick={handleNext}
                      disabled={activeStep === stores.length - 1}
                    >
                      Next
                      <KeyboardArrowRight />
                    </Button>
                  }
                  backButton={
                    <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
                      <KeyboardArrowLeft />
                      Back
                    </Button>
                  }
                />
              </CircularPercentageLoading>
            </Box>
          </Stack>
        </Container>
      </Box>
    </>
  );
}

Store.getLayout = (page: JSX.Element) => <DashboardLayout>{page}</DashboardLayout>;

export default Store;
