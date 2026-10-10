import React, { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import PlusIcon from "@heroicons/react/24/solid/PlusIcon";
import {
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { get, patch, post } from "src/lib/http";

type PublishPlatform = {
  id: string;
  name: string;
  color: string;
  loginUrl: string;
  hint: string;
  enabled: boolean;
  sort: number;
};

type ApiWrap<T> = { message?: string; data: T };

const emptyForm = {
  platformId: "",
  name: "",
  color: "#8A847A",
  loginUrl: "",
  hint: "",
  enabled: true,
  sort: "100",
};

function PublisherPlatformsPage() {
  const [items, setItems] = useState<PublishPlatform[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PublishPlatform | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await get<ApiWrap<PublishPlatform[]> | PublishPlatform[]>(
        "/api/publisher/admin/platforms",
      );
      const list = Array.isArray(res) ? res : res?.data || [];
      setItems(list);
    } catch (err) {
      toast.error((err as { message?: string })?.message || "加载发文平台失败");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (row: PublishPlatform) => {
    setEditing(row);
    setForm({
      platformId: row.id,
      name: row.name,
      color: row.color || "#8A847A",
      loginUrl: row.loginUrl || "",
      hint: row.hint || "",
      enabled: row.enabled,
      sort: String(row.sort ?? 100),
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
  };

  const onFormChange =
    (field: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const save = async () => {
    const name = form.name.trim();
    const platformId = form.platformId.trim().toLowerCase();
    if (!editing && !/^[a-z][a-z0-9_-]{1,31}$/.test(platformId)) {
      toast.error("平台 ID 需为小写字母开头，仅含字母数字_-");
      return;
    }
    if (!name) {
      toast.error("请填写平台名称");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name,
        color: form.color.trim() || "#8A847A",
        loginUrl: form.loginUrl.trim(),
        hint: form.hint.trim(),
        enabled: form.enabled,
        sort: Number(form.sort) || 100,
      };
      if (editing) {
        const res = await patch<ApiWrap<PublishPlatform> | PublishPlatform>({
          url: `/api/publisher/admin/platforms/${editing.id}`,
          payload,
        });
        // eslint-disable-next-line no-void
        void res;
        toast.success("已更新");
      } else {
        await post({
          url: "/api/publisher/admin/platforms",
          payload: { ...payload, platformId },
        });
        toast.success("已添加");
      }
      closeDialog();
      await fetchList();
    } catch (err) {
      toast.error((err as { message?: string })?.message || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const toggleEnabled = async (row: PublishPlatform) => {
    try {
      await patch({
        url: `/api/publisher/admin/platforms/${row.id}`,
        payload: { enabled: !row.enabled },
      });
      toast.success(row.enabled ? "已下线" : "已上线");
      await fetchList();
    } catch (err) {
      toast.error((err as { message?: string })?.message || "操作失败");
    }
  };

  return (
    <>
      <Head>
        <title>发文平台</title>
      </Head>
      <Box component="main" sx={{ flexGrow: 1, py: 2 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h4">发文平台</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  控制一键发文可绑定/发布的平台。下线后小程序隐藏该平台，用户历史绑定保留，重新上线可恢复。
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" onClick={fetchList} disabled={loading}>
                  {loading ? "刷新中…" : "刷新"}
                </Button>
                <Button
                  variant="contained"
                  startIcon={
                    <SvgIcon fontSize="small">
                      <PlusIcon />
                    </SvgIcon>
                  }
                  onClick={openCreate}
                >
                  添加平台
                </Button>
              </Stack>
            </Stack>

            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width={72}>排序</TableCell>
                    <TableCell width={140}>平台 ID</TableCell>
                    <TableCell>名称</TableCell>
                    <TableCell width={100}>颜色</TableCell>
                    <TableCell width={110}>状态</TableCell>
                    <TableCell align="right" width={200}>
                      操作
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.sort}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {row.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              bgcolor: row.color || "#8A847A",
                              flexShrink: 0,
                            }}
                          />
                          <Typography variant="body2">{row.name}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {row.color}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={row.enabled ? "已上线" : "已下线"}
                          color={row.enabled ? "success" : "default"}
                          variant={row.enabled ? "filled" : "outlined"}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => openEdit(row)}>
                          编辑
                        </Button>
                        <Button
                          size="small"
                          color={row.enabled ? "warning" : "success"}
                          onClick={() => toggleEnabled(row)}
                        >
                          {row.enabled ? "下线" : "上线"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!items.length && !loading && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                          暂无平台，点击「添加平台」或重启 open-api 以写入默认目录
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </Container>
      </Box>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? "编辑平台" : "添加平台"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="平台 ID"
              value={form.platformId}
              onChange={onFormChange("platformId")}
              disabled={!!editing}
              helperText="与 ALQQ platform 代码一致，如 wechat / bilibili"
              fullWidth
            />
            <TextField
              label="名称"
              value={form.name}
              onChange={onFormChange("name")}
              fullWidth
              required
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="颜色"
                value={form.color}
                onChange={onFormChange("color")}
                fullWidth
              />
              <TextField
                label="排序"
                value={form.sort}
                onChange={onFormChange("sort")}
                type="number"
                fullWidth
              />
            </Stack>
            <TextField
              label="登录/绑定说明链接"
              value={form.loginUrl}
              onChange={onFormChange("loginUrl")}
              fullWidth
            />
            <TextField
              label="提示文案"
              value={form.hint}
              onChange={onFormChange("hint")}
              fullWidth
              multiline
              minRows={2}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.enabled}
                  onChange={(_, checked) => setForm((prev) => ({ ...prev, enabled: checked }))}
                />
              }
              label={form.enabled ? "上线（小程序可见）" : "下线（小程序隐藏）"}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>取消</Button>
          <Button variant="contained" onClick={save} disabled={saving}>
            {saving ? "保存中…" : "保存"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

PublisherPlatformsPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default PublisherPlatformsPage;
