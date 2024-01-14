import { Button, Paper, Step, StepContent, StepLabel, Stepper, Typography } from "@mui/material";
import React from "react";
import theme from "tailwindcss/defaultTheme";

function getSteps() {
  return ["Select campaign settings", "Create an ad group", "Create an ad"];
}

function getStepContent(step: number) {
  switch (step) {
    case 0:
      return `For each ad campaign that you create, you can control how much
              you're willing to spend on clicks and conversions, which networks
              and geographical locations you want your ads to show on, and more.`;
    case 1:
      return "An ad group contains one or more ads which target a shared set of keywords.";
    case 2:
      return `Try out different ad text to see what brings in the most customers,
              and learn how to enhance your ads using features like ad extensions.
              If you run into any problems with your ads, find out how to tell if
              they're running and how to resolve approval issues.`;
    default:
      return "Unknown step";
  }
}

export function CompanyStepper({ id }: { id: string }) {
  const [activeStep, setActiveStep] = React.useState(0);
  const steps = getSteps();

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <div style={{ width: "100%" }}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
            <StepContent>
              <Typography>{getStepContent(index)}</Typography>
              <div style={{ marginBottom: theme.spacing[2] }}>
                <div>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    style={{
                      marginTop: theme.spacing[1],
                      marginRight: theme.spacing[1],
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    style={{
                      marginTop: theme.spacing[1],
                      marginRight: theme.spacing[1],
                    }}
                  >
                    {activeStep === steps.length - 1 ? "Finish" : "Next"}
                  </Button>
                </div>
              </div>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length && (
        <Paper
          square
          elevation={0}
          style={{
            padding: theme.spacing[3],
          }}
        >
          <Typography>All steps completed - you&apos;re finished</Typography>
          <Button
            onClick={handleReset}
            style={{
              marginTop: theme.spacing[1],
              marginRight: theme.spacing[1],
            }}
          >
            Reset
          </Button>
        </Paper>
      )}
    </div>
  );
}
