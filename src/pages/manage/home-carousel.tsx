import React, { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import PlusIcon from "@heroicons/react/24/solid/PlusIcon";
import PencilSquareIcon from "@heroicons/react/24/solid/PencilSquareIcon";
import TrashIcon from "@heroicons/react/24/solid/TrashIcon";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { toast } from "react-toastify";
import { post, patch, deleteRequest } from "src/lib/http";
import { Layout as DashboardLayout } from "../../layouts/dashboard/layout";

export interface HomeBannerItem {
  id: number;
  banner_id: string;
  title: string;
  description?: string;
  image_url: string;
  width?: number;
  height?: number;
  sort: number;
  status: number;
}

function Page() {
  const [banners, setBanners] = useState<HomeBannerItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HomeBannerItem | null>(null);
  const [formValues, setFormValues] = useState({
    title: "",
    description: "",
    image_url: "",
    width: "",
    height: "",
    sort: "",
  });

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await post<{ data: HomeBannerItem[]; rows: number; pages: number }>({
        url: "/api/home-banners/pagination",
        payload: {
          pageNum: 0,
          pageSize: 10,
          sorted: [],
          filtered: [],
        },
      });
      setBanners(res.data || []);
    } catch (error) {
      toast.error((error as { message: string })?.message || "加载轮播图失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleOpenAdd = () => {
    setEditingBanner(null);
    setFormValues({ title: "", description: "", image_url: "", width: "", height: "", sort: "" });
    setDialogOpen(true);
  };

  const handleOpenEdit = (banner: HomeBannerItem) => {
    setEditingBanner(banner);
    setFormValues({
      title: banner.title || "",
      description: banner.description || "",
      image_url: banner.image_url || "",
      width: banner.width?.toString() || "",
      height: banner.height?.toString() || "",
      sort: banner.sort?.toString() || "",
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleChange =
    (field: keyof typeof formValues) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleImageUploadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    post<{ url: string }>({
      url: "/api/file/upload",
      payload: formData,
      config: { isFile: true },
    })
      .then(({ url }) => {
        setFormValues((prev) => ({ ...prev, image_url: url }));
        toast.success("图片上传成功");
      })
      .catch((err) => {
        toast.error((err as { message: string })?.message || "图片上传失败");
      })
      .finally(() => {
        setUploading(false);
      });
  };

  const handleSubmit = async () => {
    if (!formValues.title.trim()) {
      toast.error("请填写标题");
      return;
    }
    if (!formValues.image_url.trim()) {
      toast.error("请填写图片地址");
      return;
    }

    const width = formValues.width ? Number(formValues.width) : undefined;
    const height = formValues.height ? Number(formValues.height) : undefined;
    const sort = formValues.sort ? Number(formValues.sort) : undefined;

    if ((formValues.width && Number.isNaN(width)) || (formValues.height && Number.isNaN(height))) {
      toast.error("尺寸请输入数字");
      return;
    }
    if (formValues.sort && Number.isNaN(sort)) {
      toast.error("排序请输入数字");
      return;
    }

    const payload = {
      title: formValues.title.trim(),
      description: formValues.description.trim() || undefined,
      image_url: formValues.image_url.trim(),
      width,
      height,
      sort,
    };

    try {
      if (editingBanner) {
        await patch<HomeBannerItem>({
          url: `/api/home-banners/${editingBanner.banner_id}`,
          payload,
        });
        toast.success("更新成功");
      } else {
        await post<HomeBannerItem>({
          url: "/api/home-banners",
          payload,
        });
        toast.success("创建成功");
      }
      setDialogOpen(false);
      fetchBanners();
    } catch (error) {
      toast.error((error as { message: string })?.message || "保存失败");
    }
  };

  const handleDelete = async (banner: HomeBannerItem) => {
    if (!window.confirm("确定要删除这条轮播图吗？")) return;
    try {
      await deleteRequest<never>({ url: `/api/home-banners/${banner.banner_id}` });
      toast.success("删除成功");
      fetchBanners();
    } catch (error) {
      toast.error((error as { message: string })?.message || "删除失败");
    }
  };

  return (
    <>
      <Head>
        <title>首页轮播图管理</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Stack spacing={1}>
                <Typography variant="h4">首页轮播图</Typography>
                <Typography variant="body2" color="text.secondary">
                  管理 mini_apps 小程序首页展示的轮播图图片
                </Typography>
              </Stack>
              <div>
                <Button
                  onClick={handleOpenAdd}
                  startIcon={
                    <SvgIcon fontSize="small">
                      <PlusIcon />
                    </SvgIcon>
                  }
                  variant="contained"
                >
                  添加
                </Button>
              </div>
            </Stack>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>标题</TableCell>
                    <TableCell>描述</TableCell>
                    <TableCell>图片</TableCell>
                    <TableCell>尺寸</TableCell>
                    <TableCell>排序</TableCell>
                    <TableCell align="right">操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* eslint-disable-next-line no-nested-ternary */}
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        加载中...
                      </TableCell>
                    </TableRow>
                  ) : banners.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        暂无轮播图，请点击右上角“添加”按钮新增
                      </TableCell>
                    </TableRow>
                  ) : (
                    banners.map((banner) => (
                      <TableRow key={banner.id} hover>
                        <TableCell>{banner.title}</TableCell>
                        <TableCell>{banner.description}</TableCell>
                        <TableCell>
                          {banner.image_url ? (
                            <Box
                              component="img"
                              src={banner.image_url}
                              alt={banner.title}
                              sx={{
                                width: 160,
                                height: 80,
                                objectFit: "cover",
                                borderRadius: 1,
                                border: (theme) => `1px solid ${theme.palette.divider}`,
                              }}
                            />
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          {banner.width && banner.height
                            ? `${banner.width} × ${banner.height}`
                            : "-"}
                        </TableCell>
                        <TableCell>{banner.sort ?? 0}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              size="small"
                              variant="text"
                              startIcon={
                                <SvgIcon fontSize="small">
                                  <PencilSquareIcon />
                                </SvgIcon>
                              }
                              onClick={() => handleOpenEdit(banner)}
                            >
                              编辑
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              variant="text"
                              startIcon={
                                <SvgIcon fontSize="small">
                                  <TrashIcon />
                                </SvgIcon>
                              }
                              onClick={() => handleDelete(banner)}
                            >
                              删除
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </Container>
      </Box>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingBanner ? "编辑轮播图" : "添加轮播图"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            <TextField
              label="标题"
              value={formValues.title}
              onChange={handleChange("title")}
              fullWidth
              required
            />
            <TextField
              label="描述"
              value={formValues.description}
              onChange={handleChange("description")}
              fullWidth
              multiline
              minRows={2}
            />
            <Box
              component="label"
              sx={{
                border: "2px dashed",
                borderColor: "grey.300",
                borderRadius: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                p: 2,
                cursor: "pointer",
                "&:hover": {
                  borderColor: "primary.main",
                  backgroundColor: "action.hover",
                },
              }}
            >
              <input type="file" hidden accept="image/*" onChange={handleImageUploadChange} />
              <CloudUploadIcon sx={{ fontSize: 40, color: "text.secondary", mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {uploading ? "图片上传中..." : "点击选择图片上传"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                支持 JPG、PNG 等格式，最大 5MB
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <TextField
                label="宽度(px)"
                type="number"
                value={formValues.width}
                onChange={handleChange("width")}
                fullWidth
              />
              <TextField
                label="高度(px)"
                type="number"
                value={formValues.height}
                onChange={handleChange("height")}
                fullWidth
              />
            </Stack>
            <TextField
              label="排序"
              type="number"
              value={formValues.sort}
              onChange={handleChange("sort")}
              fullWidth
            />
            {formValues.image_url && (
              <Box mt={2}>
                <Typography variant="subtitle2" gutterBottom>
                  预览：
                </Typography>
                <Box
                  component="img"
                  src={formValues.image_url}
                  alt={formValues.title}
                  sx={{
                    width: "100%",
                    maxHeight: 240,
                    objectFit: "cover",
                    borderRadius: 1,
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                  }}
                />
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button onClick={handleSubmit} variant="contained">
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

Page.getLayout = (page: JSX.Element) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
