import React, { useMemo, useState, useEffect } from "react";
import { AppBar, Box, Stack, Tab, Tabs, Unstable_Grid2 as Grid } from "@mui/material";

function a11yProps(index: number | string) {
  return {
    id: `scrollable-auto-tab-${index}`,
    "aria-controls": `scrollable-auto-tabpanel-${index}`,
  };
}

type TabItem = {
  label: string;
  key: number | string;
  isDefault?: boolean;
  children: React.ReactNode;
};

type CustomerTabsProps = {
  tabs: TabItem[];
};

function getDefaultKey(tabs: TabItem[]): number | string {
  if (tabs.length === 0) return 0;
  const defaultItem = tabs.find((i) => i.isDefault);
  return defaultItem ? defaultItem.key : tabs[0].key;
}

export default function CustomerTabs({ tabs }: CustomerTabsProps) {
  const tabKeys = useMemo(() => tabs.map((t) => String(t.key)).join("|"), [tabs]);
  const [activeKey, setActiveKey] = useState<number | string>(() => getDefaultKey(tabs));

  // 仅当 tab 的 key 集合变化时重置；避免数据加载导致 children 更新时切回默认 tab
  useEffect(() => {
    const keys = tabKeys.split("|").filter(Boolean);
    setActiveKey((prev) => (keys.includes(String(prev)) ? prev : getDefaultKey(tabs)));
    // tabs 仅在 key 变化时用于取默认项；children 内容变化不应重置选中
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabKeys]);

  // 只渲染当前选中的 tab 内容，避免未选中 tab 的组件挂载和 API 请求
  const currentTab = tabs.find((tab) => tab.key === activeKey);

  if (tabs.length === 0) return null;

  return (
    <Stack spacing={3}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <AppBar position="static" color="default">
          <Tabs
            value={activeKey}
            onChange={(e, v) => setActiveKey(v)}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            aria-label="scrollable auto tabs example"
          >
            {tabs.map(({ label, key }) => (
              <Tab
                sx={{ margin: "0 0.5rem", padding: "0 0.5rem" }}
                key={`tab-index-${key}`}
                label={label}
                value={key}
                {...a11yProps(key)}
              />
            ))}
          </Tabs>
        </AppBar>
      </Box>
      {currentTab && (
        <Box
          role="tabpanel"
          id={`scrollable-auto-tabpanel-${currentTab.key}`}
          aria-labelledby={`scrollable-auto-tab-${currentTab.key}`}
        >
          <Box p={1}>
            <Grid>
              <Grid>{currentTab.children}</Grid>
            </Grid>
          </Box>
        </Box>
      )}
    </Stack>
  );
}
