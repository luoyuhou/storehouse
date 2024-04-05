import React, { useEffect } from "react";
import { GoodsType } from "src/types/goods.type";
import { get, patch, post } from "src/lib/http";
import { toast } from "react-toastify";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  TextField,
  Typography,
  Unstable_Grid2 as Grid,
  Fab,
  Button,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Cancel, Edit, Save } from "@mui/icons-material";
import { CategoryType } from "src/types/category.type";
import utils from "src/lib/utils";
import { boolean } from "yup";
import { tree } from "next/dist/build/templates/app-page";

const GOODS_STATUS_MAP = [
  { label: "活跃", value: 1 },
  { label: "停用", value: 0 },
];

export function GoodsDetailEditing({
  id,
  setIsGoods,
}: {
  id: string;
  setIsGoods: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [stores, setStores] = React.useState<{ label: string; value: string }[]>([]);
  const [categories, setCategories] = React.useState<{ label: string; value: string }[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [editing, setEditing] = React.useState<boolean>(false);

  const formik = useFormik({
    initialValues: {
      store_id: "",
      category_id: "",
      name: "",
      status: "",
      description: "",
      submit: null,
    },
    validationSchema: Yup.object({
      store_id: Yup.string().min(16).max(64).required("店铺名* 必填"),
      category_id: Yup.string().min(16).max(64).required("分类* 必填"),
      name: Yup.string().max(16).required("商品名* 必填"),
      status: Yup.string().max(16).required("状态* 必填"),
      description: Yup.string().min(4).max(256).required("商品描述* 必填"),
      supplier: Yup.string().max(255),
    }),
    onSubmit: async ({ submit, ...values }, helpers) => {
      setSubmitting(true);

      patch({ url: `/api/store/goods/${id}`, payload: values })
        .then(() => {
          toast.success(`更新 ${values.name} 商品成功`);
          setEditing(false);
        })
        .catch((err) => {
          helpers.setStatus({ success: false });
          helpers.setErrors({ submit: (err as { message: string }).message });
          helpers.setSubmitting(false);
        })
        .finally(() => setSubmitting(false));
      // await post({ url: "/api/store/goods", payload: values, config: {} });
    },
  });

  useEffect(() => {
    const triedId = (id ?? "").trim();
    if (!triedId) {
      return;
    }

    setLoading(true);
    get<{ data: GoodsType }>(`/api/store/goods/${triedId}`)
      .then(({ data }) => {
        setStores([{ label: data.store_name!, value: data.store_id }]);
        setCategories([{ label: data.category_name!, value: data.category_id }]);
        formik.setFieldValue("store_id", data.store_id);
        formik.setFieldValue("category_id", data.category_id);
        formik.setFieldValue("name", data.name);
        formik.setFieldValue("status", data.status);
        formik.setFieldValue("description", data.description);
        setIsGoods(true);
      })
      .catch((err) => {
        toast.error(err.message);
        setIsGoods(false);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const storeId = stores[0]?.value;
    if (!storeId) {
      return;
    }

    get<{ data: (CategoryType & { children?: CategoryType[] })[] }>(
      `/api/store/category/${storeId}/tree`,
    )
      .then(({ data }) => {
        const list = utils.flattenTree(data, "children", "name");
        setCategories(list.map(({ name, category_id }) => ({ label: name, value: category_id })));
      })
      .catch((err) => toast.error(err.message));
  }, [stores]);

  if (!(id ?? "").trim()) {
    return (
      <Box sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h5">空空如也</Typography>
        <Box sx={{ marginTop: "50px" }}>
          <a href="/store/create-goods">创建商品</a>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <form noValidate onSubmit={formik.handleSubmit}>
        <Box sx={{ flexGrow: 1 }} mt={2}>
          <Grid container spacing={3}>
            <Grid xs={12} md={12} lg={12}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h6" gutterBottom>
                  商品归属
                </Typography>
                <Box>
                  {editing ? (
                    <Box>
                      <Fab
                        disabled={submitting}
                        color="primary"
                        aria-label="save"
                        onClick={() => formik.handleSubmit()}
                      >
                        <Save />
                      </Fab>
                      <Fab
                        disabled={submitting}
                        color="info"
                        aria-label="cancel"
                        onClick={() => setEditing(false)}
                      >
                        <Cancel />
                      </Fab>
                    </Box>
                  ) : (
                    <Fab color="secondary" aria-label="edit" onClick={() => setEditing(true)}>
                      <Edit />
                    </Fab>
                  )}
                </Box>
              </Box>
            </Grid>
            <Grid xs={12} md={12} lg={12}>
              <FormControl variant="filled" fullWidth>
                <InputLabel htmlFor="filled-age-native-simple">商铺 *</InputLabel>
                <Select
                  native
                  required
                  disabled
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
                  disabled={submitting || !editing}
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
            <Grid xs={12} md={6} lg={6}>
              <TextField
                error={!!(formik.touched.name && formik.errors.name)}
                fullWidth
                required
                disabled={submitting || !editing}
                helperText={formik.touched.name && formik.errors.name}
                label="商品名"
                name="name"
                type="text"
                // onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.name}
              />
            </Grid>
            <Grid xs={12} md={6} lg={6}>
              <FormControl variant="filled" fullWidth>
                <InputLabel htmlFor="filled-age-native-simple">状态 *</InputLabel>
                <Select
                  native
                  required
                  displayEmpty
                  value={formik.values.status}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  disabled={submitting || !editing}
                  name="status"
                  id="status"
                  error={!!(formik.touched.status && formik.errors.status)}
                >
                  <option aria-label="None" value="" />
                  {GOODS_STATUS_MAP.map(({ label, value }) => (
                    <option key={`province-${label}`} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12} md={12} lg={12}>
              <TextField
                error={!!(formik.touched.description && formik.errors.description)}
                fullWidth
                required
                disabled={submitting || !editing}
                helperText={formik.touched.description && formik.errors.description}
                label="商品描述"
                name="description"
                type="text"
                // onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.description}
              />
            </Grid>
          </Grid>
        </Box>
      </form>
    </Box>
  );
}
