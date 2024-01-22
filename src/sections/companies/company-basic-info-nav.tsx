import React, { useEffect } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  MobileStepper,
  Typography,
} from "@mui/material";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import { CompanyStatus } from "src/sections/companies/company-status";
import { StoreType } from "src/types/store.type";
import { CompanyProfileDetails } from "src/sections/companies/company-profile-details";

export function CompanyBasicInfoNav({
  stores,
  setStoreId,
}: {
  stores: StoreType[];
  setStoreId: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  useEffect(() => {
    if (Array.isArray(stores) && !stores.length) {
      return;
    }
    console.log("stores", stores, "activeStep", activeStep);
    setStoreId(stores[activeStep].store_id);
  }, [activeStep, stores]);

  if (Array.isArray(stores) && !stores.length) {
    return <Typography>您还未拥有通过审核的商铺</Typography>;
  }

  return (
    <Card sx={{ marginBottom: "10px" }}>
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
          <hr />
          <CompanyProfileDetails company={stores[activeStep]} />
        </Box>
      </CardContent>
      <CardActions>
        <Button fullWidth variant="text">
          挂起维护
        </Button>
      </CardActions>
      <Divider />

      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <MobileStepper
          variant="dots"
          steps={stores?.length ?? 0}
          position="static"
          activeStep={activeStep}
          sx={{
            maxWidth: 400,
            flexGrow: 1,
          }}
          nextButton={
            <Button
              size="small"
              onClick={handleNext}
              disabled={activeStep === (stores?.length ?? 0) - 1}
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
      </Box>
    </Card>
  );
}
