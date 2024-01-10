import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import React, { useEffect, useState } from "react";
import Head from "next/head";
import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { get, post } from "src/lib/http";
import { ProvinceEntity } from "src/types/provinceEntity";
import { OptionType } from "src/types/common";

function ApplyStore() {
  const [submitting, setSubmitting] = useState(false);
  const formik = useFormik({
    initialValues: {
      store_name: "",
      phone: "",
      id_name: "",
      id_code: "",
      province: "",
      city: "",
      area: "",
      town: "",
      address: "",
      submit: null,
    },
    validationSchema: Yup.object({
      store_name: Yup.string().max(16).required("店铺名* 必填"),
      phone: Yup.string().min(11).max(11).required("联系电话* 必填"),
      id_name: Yup.string().max(16).required("申请人姓名* 必填"),
      id_code: Yup.string().min(18).max(18).required("申请人身份证号码* 必填"),
      province: Yup.string().min(3).max(8).required("省/直辖市* 必填"),
      city: Yup.string().min(2).max(8).required("市* 必填"),
      area: Yup.string().max(16).required("区* 必填"),
      town: Yup.string().max(16),
      address: Yup.string().max(255).required("店铺详细地址* 必填"),
    }),
    onSubmit: async (values, helpers) => {
      setSubmitting(true);
      try {
        const data = {
          store_name: values.store_name,
          phone: values.phone,
          id_name: values.id_name,
          id_code: values.id_code,
          province: values.province,
          city: values.city,
          area: values.area,
          town: values.town,
          address: values.address,
        };
        await post({ url: "/api/store", payload: data, config: {} });
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

  const [provinceOptions, setProvinceOptions] = useState<OptionType[]>([]);
  const [cityOptions, setCityOptions] = useState<OptionType[]>([]);
  const [areaOptions, setAreaOptions] = useState<OptionType[]>([]);
  const [townOptions, setTownOptions] = useState<OptionType[]>([]);

  useEffect(() => {
    get<ProvinceEntity[]>("/api/general/province").then((res) => {
      const options = res.map(({ code, name }) => ({ label: name, value: code }));
      setProvinceOptions(options);
    });
  }, []);

  useEffect(() => {
    const value = formik.values.province;
    if (value) {
      get<ProvinceEntity[]>(`/api/general/province?pid=${value}`).then((res) => {
        const options = res.map(({ code, name }) => ({ label: name, value: code }));
        setCityOptions(options);
      });
    }
    formik.setFieldValue("city", "");
  }, [formik.values.province]);

  useEffect(() => {
    const value = formik.values.city;
    if (value) {
      get<ProvinceEntity[]>(`/api/general/province?pid=${value}`).then((res) => {
        const options = res.map(({ code, name }) => ({ label: name, value: code }));
        setAreaOptions(options);
      });
    }
    formik.setFieldValue("area", "");
  }, [formik.values.city]);

  useEffect(() => {
    const value = formik.values.area;
    if (value) {
      get<ProvinceEntity[]>(`/api/general/province?pid=${value}`).then((res) => {
        const options = res.map(({ town, name }) => ({ label: name, value: town }));
        setTownOptions(options);
      });
    }
    formik.setFieldValue("town", "");
  }, [formik.values.area]);

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
                  <Typography variant="h6" gutterBottom>
                    店铺信息
                  </Typography>
                  <TextField
                    error={!!(formik.touched.store_name && formik.errors.store_name)}
                    fullWidth
                    required
                    helperText={formik.touched.store_name && formik.errors.store_name}
                    label="店铺名"
                    name="store_name"
                    type="text"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.store_name}
                  />
                  <TextField
                    error={!!(formik.touched.phone && formik.errors.phone)}
                    fullWidth
                    required
                    helperText={formik.touched.phone && formik.errors.phone}
                    label="联系电话"
                    name="phone"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    type="text"
                    value={formik.values.phone}
                  />
                  <Typography variant="h6" gutterBottom>
                    申请人信息
                  </Typography>
                  <TextField
                    error={!!(formik.touched.id_name && formik.errors.id_name)}
                    fullWidth
                    required
                    helperText={formik.touched.id_name && formik.errors.id_name}
                    label="申请人姓名"
                    name="id_name"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    type="text"
                    value={formik.values.id_name}
                  />
                  <TextField
                    error={!!(formik.touched.id_code && formik.errors.id_code)}
                    fullWidth
                    required
                    helperText={formik.touched.id_code && formik.errors.id_code}
                    label="申请人身份证号码"
                    name="id_code"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    type="text"
                    value={formik.values.id_code}
                  />
                  <Typography variant="h6" gutterBottom>
                    店铺所在地址
                  </Typography>
                  <FormControl variant="filled">
                    <InputLabel htmlFor="filled-age-native-simple">省/直辖市</InputLabel>
                    <Select
                      native
                      required
                      value={formik.values.province}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      name="province"
                      id="province"
                      error={!!(formik.touched.province && formik.errors.province)}
                    >
                      <option aria-label="None" value="" />
                      {provinceOptions.map(({ label, value }) => (
                        <option key={`province-${label}`} value={value}>
                          {label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl variant="filled">
                    <InputLabel htmlFor="filled-age-native-simple">市</InputLabel>
                    <Select
                      native
                      required
                      value={formik.values.city}
                      name="city"
                      id="city"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      error={!!(formik.touched.city && formik.errors.city)}
                    >
                      <option aria-label="None" value="" />
                      {cityOptions.map(({ label, value }) => (
                        <option key={`city-${label}`} value={value}>
                          {label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl variant="filled">
                    <InputLabel htmlFor="filled-age-native-simple">区</InputLabel>
                    <Select
                      native
                      required
                      value={formik.values.area}
                      name="area"
                      id="area"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      error={!!(formik.touched.area && formik.errors.area)}
                    >
                      <option aria-label="None" value="" />
                      {areaOptions.map(({ label, value }) => (
                        <option key={`area-${label}`} value={value}>
                          {label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl variant="filled">
                    <InputLabel htmlFor="filled-age-native-simple">城镇地区</InputLabel>
                    <Select
                      native
                      value={formik.values.town}
                      name="town"
                      id="town"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      error={!!(formik.touched.town && formik.errors.town)}
                    >
                      <option aria-label="None" value="" />
                      {townOptions.map(({ label, value }) => (
                        <option key={`town-${value}`} value={value}>
                          {label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    error={!!(formik.touched.address && formik.errors.address)}
                    fullWidth
                    required
                    helperText={formik.touched.address && formik.errors.address}
                    label="店铺详细地址"
                    name="address"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    type="text"
                    value={formik.values.address}
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
                  申请
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
