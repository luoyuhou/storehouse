import React, { useState } from "react";
import { Box, IconButton, Typography, Dialog, DialogContent } from "@mui/material";
import { GridRenderEditCellParams } from "@mui/x-data-grid";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import ZoomInIcon from "@mui/icons-material/ZoomIn";

type ImageEditCellProps = GridRenderEditCellParams & {
  onImageChange: (id: string | number, file: File | null, previewUrl: string | null) => void;
  pendingImages: Record<string | number, { file: File; previewUrl: string }>;
};

export function ImageEditCell(props: ImageEditCellProps) {
  const { id, value, onImageChange, pendingImages } = props;
  const [isDragging, setIsDragging] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const pendingImage = pendingImages[id];
  const hasNewImage = !!pendingImage;
  const displayUrl = pendingImage?.previewUrl || (value ? `http://${value}` : null);

  const handleFileSelect = (file: File | null) => {
    if (!file) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("图片大小不能超过5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("请选择图片文件");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      onImageChange(id, file, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    // 传递 null, null 表示删除图片
    onImageChange(id, null, null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleOpenDialog = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (displayUrl) {
      setShowDialog(true);
    }
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
  };

  // 没有图片显示上传区域
  if (!displayUrl) {
    return (
      <Box
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          border: isDragging ? "2px dashed" : "1px dashed",
          borderColor: isDragging ? "primary.main" : "grey.400",
          borderRadius: 1,
          backgroundColor: isDragging ? "action.hover" : "transparent",
          transition: "all 0.2s",
          "&:hover": {
            borderColor: "primary.main",
            backgroundColor: "action.hover",
          },
        }}
        component="label"
      >
        <input type="file" hidden accept="image/*" onChange={handleImageChange} />
        <CloudUploadIcon sx={{ fontSize: 24, color: "text.secondary" }} />
        <Typography variant="caption" color="text.secondary">
          上传
        </Typography>
      </Box>
    );
  }

  // 有图片时显示预览和操作按钮
  return (
    <>
      <Box
        sx={{
          width: "100%",
          height: "100%",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0.5,
        }}
      >
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
        <img
          src={displayUrl}
          alt="商品图片"
          onClick={handleOpenDialog}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            borderRadius: 4,
            cursor: "pointer",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            display: "flex",
            gap: 0.5,
          }}
        >
          {/* 放大查看按钮 */}
          <IconButton
            size="small"
            onClick={handleOpenDialog}
            sx={{
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              color: "white",
              padding: 0.5,
              "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.7)" },
            }}
          >
            <ZoomInIcon sx={{ fontSize: 16 }} />
          </IconButton>
          {/* 更换图片按钮 */}
          <Box component="label" sx={{ cursor: "pointer" }}>
            <input type="file" hidden accept="image/*" onChange={handleImageChange} />
            <IconButton
              component="span"
              size="small"
              sx={{
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                color: "white",
                padding: 0.5,
                "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.7)" },
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
          {/* 删除图片按钮 */}
          <IconButton
            size="small"
            onClick={handleRemoveImage}
            sx={{
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              color: "white",
              padding: 0.5,
              "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.7)" },
            }}
          >
            <DeleteIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Box>

      {/* 图片预览 Dialog */}
      <Dialog open={showDialog} onClose={handleCloseDialog} maxWidth="sm">
        <DialogContent sx={{ p: 1 }}>
          <img
            src={displayUrl}
            alt="商品图片预览"
            style={{ width: 400, maxWidth: "100%", display: "block" }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
