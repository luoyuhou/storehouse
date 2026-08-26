/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Head from "next/head";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
  createFilterOptions,
} from "@mui/material";
import { toast } from "react-toastify";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { get, post, patch } from "src/lib/http";
import { UserEntity } from "src/types/users";

function formatUserLabel(user: UserEntity) {
  const name = `${user.first_name || ""} ${user.last_name || ""}`.trim();
  if (user.phone && name) return `${user.phone}（${name}）`;
  return user.phone || name || user.user_id || "";
}

const baseFilter = createFilterOptions<UserEntity>({
  stringify: (option) =>
    [option.phone, option.first_name, option.last_name, option.user_id].filter(Boolean).join(" "),
});

function PlatformSettingsPage() {
  const [options, setOptions] = useState<UserEntity[]>([]);
  const [dutyUsers, setDutyUsers] = useState<UserEntity[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const searchUsers = useCallback(async (keyword: string) => {
    const trimmed = keyword.trim();
    const filtered = trimmed ? [{ id: "phone", value: trimmed }] : [];
    const res = await post<{ data: { data: UserEntity[] } }>({
      url: "/api/users/pagination",
      payload: {
        pageNum: 0,
        pageSize: 5,
        sorted: [],
        filtered,
      },
    });
    return res.data?.data || [];
  }, []);

  const loadDutyUsers = useCallback(async () => {
    setInitialLoading(true);
    try {
      const ids = await get<string[]>("/api/platform/settings/duty-users");
      const idList = Array.isArray(ids) ? ids : [];
      if (!idList.length) {
        setDutyUsers([]);
        return;
      }

      const users = await Promise.all(
        idList.map(async (userId) => {
          try {
            return await get<UserEntity>(`/api/users/${userId}`);
          } catch {
            return null;
          }
        }),
      );
      setDutyUsers(users.filter((u): u is UserEntity => !!u && !!u.user_id));
    } catch (err) {
      toast.error((err as { message?: string })?.message || "加载值班配置失败");
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDutyUsers();
  }, [loadDutyUsers]);

  useEffect(() => {
    let active = true;
    const keyword = inputValue.trim();

    // 至少输入 2 位再远程检索，避免空搜刷全量
    if (keyword.length < 2) {
      setOptions([]);
      return undefined;
    }

    setLoadingOptions(true);
    const timer = window.setTimeout(() => {
      searchUsers(keyword)
        .then((list) => {
          if (!active) return;
          // 已选用户始终保留在 options 中，避免选中项从列表消失
          const merged = [...list];
          dutyUsers.forEach((selected) => {
            if (!merged.some((u) => u.user_id === selected.user_id)) {
              merged.unshift(selected);
            }
          });
          setOptions(merged);
        })
        .catch(() => {
          if (!active) return;
          setOptions(dutyUsers);
        })
        .finally(() => {
          if (!active) return;
          setLoadingOptions(false);
        });
    }, 300);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [inputValue, searchUsers, dutyUsers]);

  const filterOptions = useMemo(
    () => (opts: UserEntity[], state: any) => baseFilter(opts, state),
    [],
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      await patch({
        url: "/api/platform/settings/duty-users",
        payload: { user_ids: dutyUsers.map((u) => u.user_id).filter(Boolean) },
      });
      toast.success("值班配置已保存");
    } catch (err) {
      toast.error((err as { message?: string })?.message || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Head>
        <title>平台设置</title>
      </Head>
      <Box component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Container maxWidth="md">
          <Stack spacing={3}>
            <Typography variant="h4">平台设置</Typography>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                值班管理员
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                输入手机号搜索并选择用户。配置后，这些用户将负责处理「联系管理员」留言。
              </Typography>
              <Autocomplete
                multiple
                loading={loadingOptions || initialLoading}
                options={options}
                value={dutyUsers}
                filterOptions={filterOptions}
                onChange={(_, value) => setDutyUsers(value)}
                inputValue={inputValue}
                onInputChange={(_, value, reason) => {
                  if (reason === "reset") return;
                  setInputValue(value);
                }}
                getOptionLabel={formatUserLabel}
                isOptionEqualToValue={(a, b) => a.user_id === b.user_id}
                noOptionsText={
                  inputValue.trim().length < 2 ? "请输入至少 2 位手机号搜索" : "未找到用户"
                }
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.user_id}
                      label={formatUserLabel(option)}
                    />
                  ))
                }
                renderOption={(props, option) => (
                  <li {...props} key={option.user_id}>
                    <Box>
                      <Typography variant="body2">{option.phone || "-"}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {`${option.first_name || ""} ${option.last_name || ""}`.trim() ||
                          option.user_id}
                      </Typography>
                    </Box>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="搜索手机号添加值班用户"
                    placeholder="输入手机号"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingOptions ? <CircularProgress color="inherit" size={16} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving || initialLoading}
                >
                  保存
                </Button>
              </Box>
            </Paper>
          </Stack>
        </Container>
      </Box>
    </>
  );
}

PlatformSettingsPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default PlatformSettingsPage;
