import React, { Fragment, useEffect, useState } from "react";
import { Box, CircularProgress, CircularProgressProps, Typography } from "@mui/material";
import Utils from "src/lib/utils";

function CircularProgressWithLabel(props: CircularProgressProps & { value: number }) {
  return (
    <Box sx={{ height: "50px" }}>
      <Box position="absolute" right="50%" left="50%">
        <Box position="relative" display="inline-flex" mt="5px">
          <CircularProgress variant="determinate" {...props} />
          <Box
            top={0}
            left={0}
            bottom={0}
            right={0}
            position="absolute"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Typography variant="caption" component="div" color="textSecondary">{`${Math.round(
              props.value,
            )}%`}</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function progressIncrement(progress: number, timer: NodeJS.Timeout) {
  if (progress >= 100) {
    return progress % 100;
  }

  if (progress >= 99.0) {
    clearInterval(timer);
    return progress;
  }

  if (progress >= 95) {
    return progress + 0.1;
  }

  if (progress >= 90) {
    return progress + 1;
  }

  if (progress >= 80) {
    return progress + Utils.getRandom(1, 5);
  }

  return progress + Utils.getRandom(1, 10);
}

function progressFinish(progress: number, timer: NodeJS.Timeout) {
  if (progress >= 100) {
    clearInterval(timer);
    return 100;
  }

  return progress + Utils.getRandom(1, Math.floor((100 - progress) / 2) || 1);
}

export default function CircularPercentageLoading({
  loading,
  children,
}: {
  loading: boolean;
  children: React.ReactNode;
}) {
  const [progress, setProgress] = React.useState<number>(0);

  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (!loading) {
      return;
    }

    if (timer) {
      clearInterval(timer);
    }
    const t = setInterval(() => {
      setProgress((prevProgress) => progressIncrement(prevProgress, t));
    }, 400);

    setTimer(t);
  }, [loading]);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!timer) {
      return;
    }

    clearInterval(timer);

    const t = setInterval(() => {
      setProgress((prevProgress) => progressFinish(prevProgress, t));
    }, 100);
    setTimer(t);
  }, [loading]);

  if (!loading && progress >= 100) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
  }

  return <CircularProgressWithLabel value={progress} />;
}
