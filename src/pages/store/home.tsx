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
import { KeyboardArrowLeft, KeyboardArrowRight } from "@material-ui/icons";
import theme from "tailwindcss/defaultTheme";
import { get } from "src/lib/http";
import { toast } from "react-toastify";
import CircularPercentageLoading from "src/components/loading/circular-percentage.loading";
import { CompanyProfile } from "src/sections/companies/company-profile";
import { CompanyProfileDetails } from "src/sections/companies/company-profile-details";
import { StoreType } from "src/types/store.type";
import { CompanyStatus } from "src/sections/companies/company-status";

function Store() {
  const [listLoading, setListLoading] = React.useState(false);
  const [stores, setStores] = React.useState<StoreType[]>([]);
  const [activeStep, setActiveStep] = React.useState(0);

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
                        <CardActions>
                          <Button fullWidth variant="text">
                            更换商铺 Logo
                          </Button>
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
