import {
  Box,
  Button,
  Paper,
  Stack,
  Step,
  StepButton,
  StepContent,
  StepLabel,
  Stepper,
  SvgIcon,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import theme from "tailwindcss/defaultTheme";
import { EStoreStatusConst } from "src/constant/store.const";
import { FaceSmileIcon } from "@heroicons/react/20/solid";
import { get, post } from "src/lib/http";
import { toast } from "react-toastify";
import { StoreType } from "src/types/store.type";
import CircularPercentageLoading from "src/components/loading/circular-percentage.loading";
import { useFormik } from "formik";
import * as Yup from "yup";

type Option = { label: string; value: EStoreStatusConst | null; description: string };
type FiledOption = Option & { pre: boolean; next: boolean };

const options: Option[] = [
  { label: "等待审核", value: EStoreStatusConst.PENDING, description: "等待审核" },
  { label: "预览", value: EStoreStatusConst.PREVIEW, description: "申请受理中" },
  { label: "审核", value: EStoreStatusConst.REVIEWED, description: "审核已经完成, 等待处理" },
  { label: "通过", value: EStoreStatusConst.APPROVED, description: "通过审核" },
];

const failedOptions: FiledOption[] = [
  {
    label: "预览",
    value: EStoreStatusConst.PREVIEW,
    description: "申请受理中",
    pre: false,
    next: true,
  },
  {
    label: "审核",
    value: EStoreStatusConst.REVIEWED,
    description: "审核已经完成, 等待处理",
    pre: false,
    next: true,
  },
  {
    label: "拒绝",
    value: EStoreStatusConst.REJECTED,
    description: "审核未通过, 打回该申请",
    pre: true,
    next: true,
  },
  {
    label: "通过",
    value: EStoreStatusConst.APPROVED,
    description: "通过审核",
    pre: false,
    next: true,
  },
  {
    label: "禁用",
    value: EStoreStatusConst.FROZEN,
    description: "违规商家, 暂停使用",
    pre: true,
    next: false,
  },
];

export function CompanyApprover({ id }: { id: string }) {
  const [loading, setLoading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [activeStep, setActiveStep] = React.useState(-1);

  useEffect(() => {
    setLoading(true);
    get<StoreType>(`/api/store/${id}`)
      .then((res) => {
        options.forEach((item, index) => {
          if (item.value === res.status) {
            setActiveStep(index + 1);
          }
        });
      })
      .catch((err) => toast.error(JSON.stringify(err.message)))
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = (item: Option, cb: () => void) => {
    setSubmitting(true);
    post({ url: "/api/store/approver", payload: { store_id: id, status: item.value } })
      .then(() => cb())
      .catch((err) => toast.error(err.message))
      .finally(() => setSubmitting(false));
  };

  const handleNext = () => {
    const newIndex = activeStep + 1;
    const item = options[activeStep];
    if (!item) {
      return;
    }
    onSubmit(item, () => setActiveStep(newIndex));
  };

  const handleBack = () => {
    const newIndex = activeStep - 1;
    const item = options[newIndex];
    if (!item) {
      return;
    }
    onSubmit(item, () => setActiveStep(newIndex));
  };

  return (
    <Box style={{ width: "100%" }}>
      <CircularPercentageLoading loading={loading}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {options.map(({ label, description }) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
              <StepContent>
                <Typography>{description}</Typography>
                <Box style={{ marginBottom: theme.spacing[2] }}>
                  <Box>
                    <Button
                      disabled
                      onClick={() => handleBack()}
                      style={{
                        marginTop: theme.spacing[1],
                        marginRight: theme.spacing[1],
                      }}
                    >
                      上一步
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      disabled={submitting}
                      onClick={() => handleNext()}
                      style={{
                        marginTop: theme.spacing[1],
                        marginRight: theme.spacing[1],
                      }}
                    >
                      {activeStep === options.length - 1 ? "完成" : "下一步"}
                    </Button>
                  </Box>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
        {activeStep === options.length && (
          <Paper
            square
            elevation={0}
            style={{
              padding: theme.spacing[3],
            }}
          >
            <Typography>
              所有的步骤都完成了 - 您辛苦了!{" "}
              <SvgIcon fontSize="small" color="primary">
                <FaceSmileIcon />
              </SvgIcon>
            </Typography>
          </Paper>
        )}
      </CircularPercentageLoading>
    </Box>
  );
}

export function CompanyRejecter({ id }: { id: string }) {
  const [submitting, setSubmitting] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [activeStep, setActiveStep] = React.useState(0);
  const [opts, setOpts] = React.useState(failedOptions);
  const [status, setStatus] = React.useState<EStoreStatusConst>();

  useEffect(() => {
    setLoading(true);
    get<StoreType>(`/api/store/${id}`)
      .then((res) => {
        setStatus(res.status);
        let idx: number | null = null;
        opts.forEach((item, index) => {
          if (item.value === res.status) {
            idx = index;
          }
        });

        if (idx === null) {
          const filteredOptions = opts.filter(({ value }) => value === EStoreStatusConst.FROZEN);
          setOpts([
            ...filteredOptions,
            {
              label: "其他状态",
              value: res.status,
              description: "其他状态",
              pre: true,
              next: false,
            },
          ]);
          idx = filteredOptions.length;
        }

        setActiveStep(idx!);
      })
      .catch((err) => toast.error(JSON.stringify(err.message)))
      .finally(() => setLoading(false));
  }, []);

  const handleNext = () => {
    const newIndex = activeStep + 1;
    const item = failedOptions[activeStep];
    if (!item) {
      return;
    }
    setActiveStep(newIndex);
  };

  const handleBack = () => {
    const newIndex = activeStep - 1;
    const item = failedOptions[newIndex];
    if (!item) {
      return;
    }
    setActiveStep(newIndex);
  };

  const formik = useFormik({
    children: undefined,
    component: undefined,
    initialErrors: undefined,
    initialTouched: undefined,
    initialValues: {
      reason: "",
      submit: null,
    },
    innerRef: undefined,
    isInitialValid: undefined,
    validationSchema: Yup.object({
      reason: Yup.string().min(10).required("原因* 必填"),
    }),
    onSubmit: async (values, helpers) => {
      setSubmitting(true);
      try {
        await post({
          url: "/api/store/approver",
          payload: { store_id: id, status: opts[activeStep].value, reason: values.reason },
        });
        toast.success("Successful updated");
      } catch (err) {
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: (err as { message: string }).message });
        helpers.setSubmitting(false);
      }
      setSubmitting(false);
    },
  });

  return (
    <Box style={{ width: "100%" }}>
      <CircularPercentageLoading loading={loading}>
        <Stepper nonLinear activeStep={activeStep}>
          {failedOptions.map(({ label }) => (
            <Step key={label}>
              <StepButton onClick={() => handleNext()}>{label}</StepButton>
            </Step>
          ))}
        </Stepper>
        <Box mt="1px">
          <Box mt="1px">
            <Typography
              sx={{
                marginTop: theme.spacing[1],
                marginBottom: theme.spacing[1],
              }}
            >
              {failedOptions[activeStep]?.description}
            </Typography>
            <Box>
              <Button
                disabled={activeStep === 0 || submitting || !failedOptions[activeStep].pre}
                onClick={handleBack}
              >
                上一步
              </Button>
              <Button
                disabled={submitting || !failedOptions[activeStep]?.next}
                variant="contained"
                color="primary"
                onClick={handleNext}
              >
                下一步
              </Button>
            </Box>
            <Box mt="5px">
              <form id="reason-form" noValidate onSubmit={formik.handleSubmit}>
                <Stack spacing={3}>
                  <TextField
                    error={
                      !!(
                        status !== opts[activeStep].value &&
                        formik.touched.reason &&
                        formik.errors.reason
                      )
                    }
                    helperText={
                      status !== opts[activeStep].value &&
                      formik.touched.reason &&
                      formik.errors.reason
                    }
                    label="原因"
                    name="reason"
                    fullWidth
                    placeholder="请在这个地方填写更新的原因"
                    required
                    disabled={submitting || status === opts[activeStep].value}
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.reason}
                  />
                </Stack>
                <Stack>
                  <Button
                    disabled={submitting || status === opts[activeStep].value}
                    fullWidth
                    size="large"
                    sx={{ mt: 3 }}
                    type="submit"
                    variant="contained"
                  >
                    提交
                  </Button>
                </Stack>
              </form>
            </Box>
          </Box>
        </Box>
      </CircularPercentageLoading>
    </Box>
  );
}
