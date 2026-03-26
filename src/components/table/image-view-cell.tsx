import React, { useState } from "react";
import { Box, Dialog, DialogContent } from "@mui/material";

type ImageViewCellProps = {
  value: string | null | undefined;
};

export function ImageViewCell({ value }: ImageViewCellProps) {
  const [showDialog, setShowDialog] = useState(false);

  if (!value) {
    return <span style={{ color: "#999", fontSize: 12 }}>无图片</span>;
  }

  const imageUrl = `http://${value}`;

  return (
    <>
      <Box
        onClick={() => setShowDialog(true)}
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          padding: 0.5,
          "&:hover": {
            opacity: 0.8,
          },
        }}
      >
        <img
          src={imageUrl}
          alt="商品图片"
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            borderRadius: 4,
          }}
        />
      </Box>

      {/* 图片预览 Dialog */}
      <Dialog open={showDialog} onClose={() => setShowDialog(false)} maxWidth="sm">
        <DialogContent sx={{ p: 1 }}>
          <img
            src={imageUrl}
            alt="商品图片预览"
            style={{ width: 400, maxWidth: "100%", display: "block" }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
