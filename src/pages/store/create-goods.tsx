import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import React, { useEffect } from "react";
import Head from "next/head";
import {
  Box,
  Container,
  FormControl,
  InputLabel,
  Select,
  Stack,
  TextField,
  Typography,
  Unstable_Grid2 as Grid,
  Link,
  Button,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { get, post } from "src/lib/http";
import { toast } from "react-toastify";
import { StoreType } from "src/types/store.type";
import { CategoryType } from "src/types/category.type";
import utils from "src/lib/utils";
import { GOODS_UNIT_NAMES } from "src/constant/goods.const";

type Option = { label: string; value: string };

function CreateGoods() {
  const [storeLoading, setStoreLoading] = React.useState<boolean>(false);
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [stores, setStores] = React.useState<Option[]>([]);
  const [categoryLoading, setCategoryLoading] = React.useState(false);
  const [categories, setCategories] = React.useState<Option[]>([]);

  useEffect(() => {
    setStoreLoading(true);
    get<{ data: StoreType[] }>("/api/store")
      .then((res) =>
        setStores(
          res.data.map(({ store_id, store_name }) => ({ label: store_name, value: store_id })),
        ),
      )
      .catch((err) => toast.error(err.message))
      .finally(() => setStoreLoading(false));
  }, []);

  const formik = useFormik({
    initialValues: {
      store_id: "",
      category_id: "",
      name: "",
      description: "",
      unit_name: "",
      price: "",
      count: "",
      version_number: "",
      bar_code: "",
      supplier: "",
      submit: null,
    },
    validationSchema: Yup.object({
      store_id: Yup.string().min(16).max(64).required("店铺名* 必填"),
      category_id: Yup.string().min(16).max(64).required("分类* 必填"),
      name: Yup.string().max(16).required("商品名* 必填"),
      description: Yup.string().min(4).max(18).required("商品描述* 必填"),
      unit_name: Yup.string().min(1).max(8).required("单位* 必填"),
      price: Yup.string().max(16).required("价格* 必填"),
      count: Yup.string().min(2).max(8).required("数量* 必填"),
      version_number: Yup.string().max(8).max(32),
      bar_code: Yup.string().max(8).max(32),
      supplier: Yup.string().max(255),
    }),
    onSubmit: async ({ submit, ...values }, helpers) => {
      setSubmitting(true);
      try {
        await post({ url: "/api/store/goods", payload: values, config: {} });
        toast.success(`创建 ${values.name} 商品成功`);
        // router.push("/auth/sign-in");
      } catch (err) {
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: (err as { message: string }).message });
        helpers.setSubmitting(false);
      }
      setSubmitting(false);
    },
  });

  useEffect(() => {
    const storeId = formik.values.store_id;
    if (!storeId) {
      setCategories([]);
      return;
    }
    setCategoryLoading(true);
    get<{ data: (CategoryType & { children?: CategoryType[] })[] }>(
      `/api/store/category/${storeId}/tree`,
    )
      .then(({ data }) => {
        const list = utils.flattenTree(data, "children", "name");
        setCategories(list.map(({ name, category_id }) => ({ label: name, value: category_id })));
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setCategoryLoading(false));
  }, [formik.values.store_id]);

  return (
    <>
      <Head>
        <title>Create Goods</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 2,
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={3}>
            <div>
              <Typography variant="h4">创建商品</Typography>
            </div>
            <form noValidate onSubmit={formik.handleSubmit}>
              <Box sx={{ flexGrow: 1 }} mt={2}>
                <Grid container spacing={3}>
                  <Grid xs={12} md={12} lg={12}>
                    <Typography variant="h6" gutterBottom>
                      商品归属
                    </Typography>
                  </Grid>
                  <Grid xs={12} md={12} lg={12}>
                    <FormControl variant="filled" fullWidth>
                      <InputLabel htmlFor="filled-age-native-simple">商铺 *</InputLabel>
                      <Select
                        native
                        required
                        displayEmpty
                        value={formik.values.store_id}
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        name="store_id"
                        id="store_id"
                        error={!!(formik.touched.store_id && formik.errors.store_id)}
                      >
                        <option aria-label="None" value="" />
                        {stores.map(({ label, value }) => (
                          <option key={`province-${label}`} value={value}>
                            {label}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid xs={12} md={12} lg={12}>
                    <FormControl variant="filled" fullWidth>
                      <InputLabel htmlFor="filled-age-native-simple">分类 *</InputLabel>
                      <Select
                        native
                        required
                        displayEmpty
                        value={formik.values.category_id}
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        name="category_id"
                        id="category_id"
                        error={!!(formik.touched.category_id && formik.errors.category_id)}
                      >
                        <option aria-label="None" value="" />
                        {categories.map(({ label, value }) => (
                          <option key={`province-${label}`} value={value}>
                            {label}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid xs={12} md={12} lg={12}>
                    <Typography variant="h6" gutterBottom>
                      商品信息
                    </Typography>
                  </Grid>
                  <Grid xs={12} md={12} lg={12}>
                    <TextField
                      error={!!(formik.touched.name && formik.errors.name)}
                      fullWidth
                      required
                      helperText={formik.touched.name && formik.errors.name}
                      label="商品名"
                      name="name"
                      type="text"
                      // onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.name}
                    />
                  </Grid>
                  <Grid xs={12} md={12} lg={12}>
                    <TextField
                      error={!!(formik.touched.description && formik.errors.description)}
                      fullWidth
                      required
                      helperText={formik.touched.description && formik.errors.description}
                      label="商品描述"
                      name="description"
                      type="text"
                      // onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.description}
                    />
                  </Grid>
                  <Grid xs={12} md={12} lg={12}>
                    <Typography variant="h6" gutterBottom>
                      商品版本
                    </Typography>
                  </Grid>
                  <Grid xs={12} md={6} lg={4}>
                    <FormControl variant="filled" fullWidth>
                      <InputLabel htmlFor="filled-age-native-simple">单位名称 *</InputLabel>
                      <Select
                        native
                        required
                        value={formik.values.unit_name}
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        name="unit_name"
                        id="unit_name"
                        error={!!(formik.touched.unit_name && formik.errors.unit_name)}
                      >
                        <option aria-label="None" value="" />
                        {GOODS_UNIT_NAMES.map(({ label, value }) => (
                          <option key={`province-${label}`} value={value}>
                            {label}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid xs={12} md={6} lg={4}>
                    <TextField
                      error={!!(formik.touched.price && formik.errors.price)}
                      fullWidth
                      required
                      helperText={formik.touched.price && formik.errors.price}
                      label="价格"
                      name="price"
                      type="number"
                      // startAdornment={<InputAdornment position="start">$</InputAdornment>}
                      // onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.price}
                    />
                  </Grid>
                  <Grid xs={12} md={6} lg={4}>
                    <TextField
                      error={!!(formik.touched.count && formik.errors.count)}
                      fullWidth
                      required
                      helperText={formik.touched.count && formik.errors.count}
                      label="商品数量"
                      name="count"
                      type="number"
                      // onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.count}
                    />
                  </Grid>
                  <Grid xs={12} md={6} lg={4}>
                    <TextField
                      error={!!(formik.touched.version_number && formik.errors.version_number)}
                      fullWidth
                      helperText={formik.touched.version_number && formik.errors.version_number}
                      label="生成批号"
                      name="version_number"
                      type="text"
                      // onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.version_number}
                    />
                  </Grid>
                  <Grid xs={12} md={6} lg={4}>
                    <TextField
                      error={!!(formik.touched.bar_code && formik.errors.bar_code)}
                      fullWidth
                      helperText={formik.touched.bar_code && formik.errors.bar_code}
                      label="条形码"
                      name="bar_code"
                      type="text"
                      // onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.bar_code}
                    />
                  </Grid>
                  <Grid xs={12} md={6} lg={4}>
                    <TextField
                      error={!!(formik.touched.supplier && formik.errors.supplier)}
                      fullWidth
                      helperText={formik.touched.supplier && formik.errors.supplier}
                      label="供应商"
                      name="supplier"
                      type="text"
                      // onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.supplier}
                    />
                  </Grid>
                </Grid>
              </Box>
              {formik.errors.submit && (
                <Container>
                  <Typography color="error" sx={{ mt: 3 }} variant="body2">
                    {formik.errors.submit}
                  </Typography>
                  <Link href="/apply/store/list" target="_blank">
                    查看申请列表
                  </Link>
                </Container>
              )}
              <Grid container spacing={1} mt={2} sx={{ textAlign: "right" }}>
                <Grid xs={1} md={4} lg={4} />
                <Grid xs={5} md={4} lg={4}>
                  <Button type="submit" variant="contained">
                    创建 & 清除
                  </Button>
                </Grid>
                <Grid xs={6} md={4} lg={4}>
                  <Button type="submit" variant="contained">
                    创建 & 添加新版本
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Stack>
        </Container>
      </Box>
    </>
  );
}

CreateGoods.getLayout = (page: JSX.Element) => <DashboardLayout>{page}</DashboardLayout>;

export default CreateGoods;
