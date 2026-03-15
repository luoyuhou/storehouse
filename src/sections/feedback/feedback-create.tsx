import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  SvgIcon,
  TextField,
  Typography,
} from "@mui/material";
import { post } from "src/lib/http";
import { toast } from "react-toastify";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import { FEEDBACK_CATEGORY_OPTIONS } from "src/constant/feedback.const";

export function FeedbackCreate({
  dialogOpen,
  handleCloseDialog,
  reload,
}: {
  dialogOpen: boolean;
  handleCloseDialog: (val: boolean) => void;
  reload: () => void;
}) {
  const [title, setTitle] = useState<string>("");
  const [category, setCategory] = useState<string>("feature");
  const [content, setContent] = useState("");
  const [uploading, setUploading] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [videoUrls, setVideoUrls] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);

  const handleUploadImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (!files || !files.length) return;

    const fileArray = Array.from(files);
    const invalid = fileArray.find((file) => !file.type.startsWith("image/"));
    if (invalid) {
      toast.error("仅支持上传图片文件");
      return;
    }

    const tooLarge = fileArray.find((file) => file.size > 5 * 1024 * 1024);
    if (tooLarge) {
      toast.error("图片大小不能超过 5MB");
      return;
    }

    setSelectedFiles((prev) => [...prev, ...fileArray]);

    // 生成本地预览
    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddVideoUrl = () => {
    const url = videoUrlInput.trim();
    if (!url) return;
    setVideoUrls((prev) => (prev.includes(url) ? prev : [...prev, url]));
    setVideoUrlInput("");
  };

  const handleRemoveVideo = (url: string) => {
    setVideoUrls((prev) => prev.filter((item) => item !== url));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("请填写标题");
      return;
    }
    if (!content.trim()) {
      toast.error("请填写内容");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("content", content.trim());
      if (category) formData.append("category", category);

      // 处理视频链接（通过 JSON 字符串传递）
      if (videoUrls.length > 0) {
        const attachments = videoUrls.map((url) => ({ type: "video", url }));
        formData.append("attachments", JSON.stringify(attachments));
      }

      // 处理图片文件
      if (selectedFiles.length > 0) {
        selectedFiles.forEach((file) => {
          formData.append("files", file);
        });
      }

      await post<{ message: string }>({
        url: "/api/feedback",
        payload: formData,
        config: { isFile: true },
      });
      toast.success("提交成功");
      handleCloseDialog(false);
      setTitle("");
      setCategory("feature");
      setContent("");
      setSelectedFiles([]);
      setPreviewUrls([]);
      setVideoUrlInput("");
      setVideoUrls([]);

      reload();
    } catch (error) {
      toast.error((error as { message?: string })?.message || "提交失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
      <DialogTitle>提交意见 / 建议</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="标题"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <FormControl fullWidth>
            <InputLabel id="feedback-category-label">分类</InputLabel>
            <Select
              labelId="feedback-category-label"
              label="分类"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {FEEDBACK_CATEGORY_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="详细描述"
            fullWidth
            multiline
            minRows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              图片附件（可选）
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                disabled={uploading}
              >
                选择图片
                <input type="file" accept="image/*" multiple hidden onChange={handleUploadImages} />
              </Button>
              {uploading && (
                <Typography variant="caption" color="text.secondary">
                  上传中...
                </Typography>
              )}
            </Stack>
            {previewUrls.length > 0 && (
              <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                {previewUrls.map((url, index) => (
                  <Box key={url} sx={{ position: "relative", width: 80, height: 80, mr: 1, mb: 1 }}>
                    <Box
                      component="img"
                      src={url}
                      alt="预览图片"
                      sx={{
                        width: "100%",
                        height: "100%",
                        borderRadius: 1,
                        objectFit: "cover",
                      }}
                    />
                    <IconButton
                      size="small"
                      sx={{
                        position: "absolute",
                        top: -10,
                        right: -10,
                        backgroundColor: "rgba(0,0,0,0.6)",
                        color: "white",
                      }}
                      onClick={() => handleRemoveImage(index)}
                    >
                      <SvgIcon fontSize="small">
                        <DeleteIcon />
                      </SvgIcon>
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              视频链接（可选）
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                label="粘贴视频链接"
                fullWidth
                size="small"
                value={videoUrlInput}
                onChange={(e) => setVideoUrlInput(e.target.value)}
              />
              <Button variant="outlined" onClick={handleAddVideoUrl}>
                添加
              </Button>
            </Stack>
            {videoUrls.length > 0 && (
              <Stack spacing={0.5} mt={1}>
                {videoUrls.map((url) => (
                  <Stack
                    key={url}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        maxWidth: "100%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {url}
                    </Typography>
                    <IconButton size="small" onClick={() => handleRemoveVideo(url)}>
                      <SvgIcon fontSize="small">
                        <DeleteIcon />
                      </SvgIcon>
                    </IconButton>
                  </Stack>
                ))}
              </Stack>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleCloseDialog(false)} disabled={saving}>
          取消
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={saving}>
          {saving ? "提交中..." : "提交"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
