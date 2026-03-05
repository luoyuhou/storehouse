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

  const [imageUrls, setImageUrls] = useState<string[]>([]);
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

    setUploading(true);

    Promise.all(
      fileArray.map((file) => {
        const formData = new FormData();
        formData.append("file", file);
        return post<{ url: string }>({
          url: "/api/file/upload",
          payload: formData,
          config: { isFile: true },
        });
      }),
    )
      .then((results) => {
        const urls = results.map((res) => res.url).filter(Boolean);
        setImageUrls((prev) => [...prev, ...urls]);
        toast.success("图片上传成功");
      })
      .catch((error) => {
        toast.error((error as { message?: string })?.message || "图片上传失败");
      })
      .finally(() => {
        setUploading(false);
      });
  };

  const handleRemoveImage = (url: string) => {
    setImageUrls((prev) => prev.filter((item) => item !== url));
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

    const attachments: { type: "image" | "video"; url: string }[] = [];
    imageUrls.forEach((url) => {
      attachments.push({ type: "image", url });
    });
    videoUrls.forEach((url) => {
      attachments.push({ type: "video", url });
    });

    setSaving(true);
    try {
      await post<{ message: string }>({
        url: "/api/feedback",
        payload: {
          title: title.trim(),
          content: content.trim(),
          category: category || undefined,
          attachments,
        },
      });
      toast.success("提交成功");
      handleCloseDialog(false);
      setTitle("");
      setCategory("");
      setContent("");
      setImageUrls([]);
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
            {imageUrls.length > 0 && (
              <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                {imageUrls.map((url) => (
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
                      onClick={() => handleRemoveImage(url)}
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
