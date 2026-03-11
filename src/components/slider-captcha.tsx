import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
import { ChevronRight as ChevronRightIcon, Check as CheckIcon } from "@mui/icons-material";

const SliderWrapper = styled(Paper)(({ theme }) => ({
  position: "relative",
  width: "100%",
  height: "42px",
  backgroundColor: "#f5f5f5",
  borderRadius: "4px",
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  userSelect: "none",
  border: "1px solid #e0e0e0",
}));

const SliderTrack = styled(Box, {
  shouldForwardProp: (prop) => prop !== "width" && prop !== "success",
})<{ width: number; success: boolean }>(({ width, success, theme }) => ({
  position: "absolute",
  left: 0,
  top: 0,
  height: "100%",
  width: `${width}px`,
  backgroundColor: success ? theme.palette.success.light : theme.palette.primary.light,
  opacity: 0.3,
  transition: success ? "width 0.2s ease" : "none",
}));

const SliderButton = styled(Box, {
  shouldForwardProp: (prop) => prop !== "left" && prop !== "success",
})<{ left: number; success: boolean }>(({ left, success, theme }) => ({
  position: "absolute",
  left: `${left}px`,
  top: "1px",
  width: "40px",
  height: "38px",
  backgroundColor: "#fff",
  borderRadius: "4px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: success ? "default" : "pointer",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  zIndex: 2,
  transition: success ? "left 0.2s ease" : "none",
  "&:hover": {
    backgroundColor: success ? "#fff" : "#f8f8f8",
  },
}));

interface SliderCaptchaProps {
  onSuccess: () => void;
  disabled?: boolean;
  reset?: boolean;
}

// eslint-disable-next-line react/function-component-definition
export const SliderCaptcha: React.FC<SliderCaptchaProps> = ({ onSuccess, disabled, reset }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(0);
  const [success, setSuccess] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);

  const maxPosition = containerRef.current ? containerRef.current.offsetWidth - 42 : 0;

  useEffect(() => {
    if (reset) {
      setPosition(0);
      setSuccess(false);
      setIsDragging(false);
    }
  }, [reset]);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (success || disabled) return;
    setIsDragging(true);
    startX.current = "touches" in e ? e.touches[0].clientX : e.clientX;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !containerRef.current) return;

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const deltaX = clientX - startX.current;
      const maxPos = containerRef.current.offsetWidth - 42;

      const newPos = Math.max(0, Math.min(deltaX, maxPos));
      setPosition(newPos);

      if (newPos >= maxPos - 2) {
        setIsDragging(false);
        setSuccess(true);
        setPosition(maxPos);
        onSuccess();
      }
    };

    const handleMouseUp = () => {
      if (!isDragging) return;
      setIsDragging(false);
      if (!success) {
        setPosition(0);
      }
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleMouseMove);
      window.addEventListener("touchend", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleMouseMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, success, onSuccess]);

  return (
    <SliderWrapper ref={containerRef} elevation={0} sx={{ opacity: disabled ? 0.6 : 1 }}>
      <SliderTrack width={position + 20} success={success} />
      <SliderButton
        left={position}
        success={success}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        {success ? <CheckIcon color="success" /> : <ChevronRightIcon color="action" />}
      </SliderButton>
      <Typography
        variant="body2"
        sx={{
          zIndex: 1,
          color: success ? "success.main" : "text.secondary",
          fontWeight: success ? "bold" : "normal",
        }}
      >
        {success ? "验证通过" : "请按住滑块向右拖动"}
      </Typography>
    </SliderWrapper>
  );
};
