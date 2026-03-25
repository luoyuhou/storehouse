import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import React, { useEffect, useState } from "react";
import Head from "next/head";
import {
  Box,
  Container,
  Stack,
  Typography,
  Unstable_Grid2 as Grid,
  MobileStepper,
  Button,
  CardContent,
  Avatar,
  Divider,
  CardActions,
  Card,
  Collapse,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
} from "@mui/material";
import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from "@mui/icons-material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { get, patch } from "src/lib/http";
import { toast } from "react-toastify";
import CircularPercentageLoading from "src/components/loading/circular-percentage.loading";
import { CompanyProfileDetails } from "src/sections/companies/company-profile-details";
import { StoreType, StoryHistoryType } from "src/types/store.type";
import { CompanyStatus } from "src/sections/companies/company-status";
import dayjs from "dayjs";

function StoreHome() {
  const [listLoading, setListLoading] = useState(false);
  const [stores, setStores] = useState<StoreType[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [uploadingWechat, setUploadingWechat] = useState(false);
  const [uploadingAlipay, setUploadingAlipay] = useState(false);

  // 操作日志状态
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyData, setHistoryData] = useState<StoryHistoryType[]>([]);
  const [historyPage, setHistoryPage] = useState(0);
  const historyPageSize = 5;

  useEffect(() => {
    setListLoading(true);
    get<{ data: StoreType[] }>("/api/store")
      .then((res) => setStores(res.data))
      .catch((err) => toast.error(err.message))
      .finally(() => setListLoading(false));
  }, []);

  // 加载操作日志
  useEffect(() => {
    const currentStore = stores[activeStep];
    if (!currentStore || !historyOpen) return;

    setHistoryLoading(true);
    get<StoryHistoryType[]>(`/api/store/history/${currentStore.store_id}`)
      .then((res) => setHistoryData(res))
      .catch((err) => toast.error(err.message))
      .finally(() => setHistoryLoading(false));
  }, [stores, activeStep, historyOpen]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setHistoryOpen(false);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setHistoryOpen(false);
  };

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedType, setSelectedType] = useState<"wechat" | "alipay" | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange =
    (type: "wechat" | "alipay") => (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        toast.error("图片大小不能超过5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("请选择图片文件");
        return;
      }

      setSelectedFile(file);
      setSelectedType(type);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    };

  const handleUploadQr = async () => {
    const currentStore = stores[activeStep];
    if (!currentStore || !selectedFile || !selectedType) return;

    const type = selectedType;
    if (type === "wechat") setUploadingWechat(true);
    if (type === "alipay") setUploadingAlipay(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      if (type === "wechat") {
        formData.append("wechat_qr_url", "");
      } else {
        formData.append("alipay_qr_url", "");
      }

      const response = await patch<{ wechat_qr_url?: string; alipay_qr_url?: string }>({
        url: `/api/store/${currentStore.store_id}/qr`,
        payload: formData,
        config: { isFile: true },
      });

      const updatedUrl = type === "wechat" ? response.wechat_qr_url : response.alipay_qr_url;

      setStores((prev) => {
        const next = [...prev];
        next[activeStep] = {
          ...next[activeStep],
          wechat_qr_url: type === "wechat" ? updatedUrl : next[activeStep].wechat_qr_url,
          alipay_qr_url: type === "alipay" ? updatedUrl : next[activeStep].alipay_qr_url,
        };
        return next;
      });

      toast.success(`${type === "wechat" ? "微信" : "支付宝"}收款码已更新`);
      setSelectedFile(null);
      setSelectedType(null);
      setPreviewUrl(null);
    } catch (err) {
      toast.error((err as { message?: string })?.message || "上传收款码失败");
    } finally {
      if (type === "wechat") setUploadingWechat(false);
      if (type === "alipay") setUploadingAlipay(false);
    }
  };

  const handleCancelUpload = () => {
    setSelectedFile(null);
    setSelectedType(null);
    setPreviewUrl(null);
  };

  const currentStore = stores[activeStep];

  return (
    <>
      <Head>
        <title>我的商店</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 3,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <div>
              <Typography variant="h4">我的商店</Typography>
            </div>
            <Box sx={{ flexGrow: 1 }}>
              <CircularPercentageLoading loading={listLoading}>
                <Grid container spacing={3}>
                  <Grid xs={12} md={6} lg={4}>
                    {currentStore && (
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
                              src={currentStore.logo}
                              sx={{
                                height: 80,
                                mb: 2,
                                width: 80,
                                fontSize: "24px",
                              }}
                            >
                              {currentStore.store_name.slice(0, 2)}
                            </Avatar>
                            <Typography gutterBottom variant="h5">
                              {currentStore.store_name}
                            </Typography>
                            <CompanyStatus status={currentStore.status} />
                            <Typography color="text.secondary" variant="body2">
                              商家: {currentStore.id_name}
                            </Typography>
                            <Typography color="text.secondary" variant="body2">
                              身份证号码: {currentStore.id_code}
                            </Typography>
                            <Typography color="text.secondary" variant="body2">
                              电话: {currentStore.phone}
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
                                  borderColor:
                                    selectedType === "wechat" ? "primary.main" : "grey.300",
                                  borderRadius: 1,
                                  p: 1,
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  backgroundColor:
                                    selectedType === "wechat" ? "action.hover" : "transparent",
                                  "&:hover": {
                                    borderColor: "primary.main",
                                  },
                                }}
                              >
                                <input
                                  type="file"
                                  hidden
                                  accept="image/*"
                                  onChange={handleFileChange("wechat")}
                                />
                                <CloudUploadIcon
                                  sx={{ fontSize: 28, color: "text.secondary", mb: 0.5 }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {uploadingWechat ? "微信收款码上传中..." : "微信收款码"}
                                </Typography>
                                {(selectedType === "wechat" && previewUrl) ||
                                currentStore.wechat_qr_url ? (
                                  <Box
                                    component="img"
                                    src={
                                      (selectedType === "wechat" && previewUrl) ||
                                      (currentStore.wechat_qr_url as string)
                                    }
                                    alt="微信收款码"
                                    sx={{
                                      mt: 1,
                                      width: 72,
                                      height: 72,
                                      objectFit: "contain",
                                      borderRadius: 1,
                                      opacity: selectedType === "wechat" ? 0.7 : 1,
                                    }}
                                  />
                                ) : null}
                              </Box>
                              <Box
                                component="label"
                                sx={{
                                  flex: 1,
                                  border: "1px dashed",
                                  borderColor:
                                    selectedType === "alipay" ? "primary.main" : "grey.300",
                                  borderRadius: 1,
                                  p: 1,
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  backgroundColor:
                                    selectedType === "alipay" ? "action.hover" : "transparent",
                                  "&:hover": {
                                    borderColor: "primary.main",
                                  },
                                }}
                              >
                                <input
                                  type="file"
                                  hidden
                                  accept="image/*"
                                  onChange={handleFileChange("alipay")}
                                />
                                <CloudUploadIcon
                                  sx={{ fontSize: 28, color: "text.secondary", mb: 0.5 }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {uploadingAlipay ? "支付宝收款码上传中..." : "支付宝收款码"}
                                </Typography>
                                {(selectedType === "alipay" && previewUrl) ||
                                currentStore.alipay_qr_url ? (
                                  <Box
                                    component="img"
                                    src={
                                      (selectedType === "alipay" && previewUrl) ||
                                      (currentStore.alipay_qr_url as string)
                                    }
                                    alt="支付宝收款码"
                                    sx={{
                                      mt: 1,
                                      width: 72,
                                      height: 72,
                                      objectFit: "contain",
                                      borderRadius: 1,
                                      opacity: selectedType === "alipay" ? 0.7 : 1,
                                    }}
                                  />
                                ) : null}
                              </Box>
                            </Stack>
                            {selectedFile && (
                              <Stack direction="row" spacing={1} mt={2}>
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={handleUploadQr}
                                  disabled={uploadingWechat || uploadingAlipay}
                                  fullWidth
                                >
                                  确认上传 {selectedType === "wechat" ? "微信" : "支付宝"}
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={handleCancelUpload}
                                  disabled={uploadingWechat || uploadingAlipay}
                                >
                                  取消
                                </Button>
                              </Stack>
                            )}
                          </Box>
                        </CardActions>
                      </Card>
                    )}
                  </Grid>
                  <Grid xs={12} md={6} lg={8}>
                    {currentStore && <CompanyProfileDetails company={currentStore} />}

                    {/* 操作日志折叠面板 */}
                    <Card sx={{ mt: 3 }}>
                      <CardActions sx={{ justifyContent: "space-between", px: 2 }}>
                        <Typography variant="h6">操作日志</Typography>
                        <IconButton onClick={() => setHistoryOpen(!historyOpen)}>
                          {historyOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                        </IconButton>
                      </CardActions>
                      <Collapse in={historyOpen}>
                        <Divider />
                        <CircularPercentageLoading loading={historyLoading}>
                          <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                            <Table size="small" stickyHeader>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Store ID</TableCell>
                                  <TableCell>类型</TableCell>
                                  <TableCell>申请内容</TableCell>
                                  <TableCell>申请时间</TableCell>
                                  <TableCell>备注</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {historyData
                                  .slice(
                                    historyPage * historyPageSize,
                                    (historyPage + 1) * historyPageSize,
                                  )
                                  .map((row) => (
                                    <TableRow key={row.id} hover>
                                      <TableCell>{row.store_id}</TableCell>
                                      <TableCell>{row.action_type}</TableCell>
                                      <TableCell>{row.action_content}</TableCell>
                                      <TableCell>
                                        {row.action_date
                                          ? dayjs(row.action_date).format("YYYY-MM-DD HH:mm:ss")
                                          : ""}
                                      </TableCell>
                                      <TableCell>{row.payload ?? "N/A"}</TableCell>
                                    </TableRow>
                                  ))}
                                {historyData.length === 0 && (
                                  <TableRow>
                                    <TableCell colSpan={5} align="center">
                                      <Typography color="textSecondary" sx={{ py: 2 }}>
                                        暂无操作记录
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </TableContainer>
                          {historyData.length > historyPageSize && (
                            <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
                              <Pagination
                                count={Math.ceil(historyData.length / historyPageSize)}
                                size="small"
                                onChange={(_, p) => setHistoryPage(p - 1)}
                              />
                            </Box>
                          )}
                        </CircularPercentageLoading>
                      </Collapse>
                    </Card>
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

StoreHome.getLayout = (page: JSX.Element) => <DashboardLayout>{page}</DashboardLayout>;

export default StoreHome;
