import React from "react";
import { AppBar, Box, Stack, Tab, Tabs, Typography, Unstable_Grid2 as Grid } from "@mui/material";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function a11yProps(index: number) {
  return {
    id: `scrollable-auto-tab-${index}`,
    "aria-controls": `scrollable-auto-tabpanel-${index}`,
  };
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={1}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </Box>
  );
}

type TabItem = {
  label: string;
  key: number;
  isDefault?: boolean;
  children: React.ReactNode;
};

type CustomerTabsProps = {
  tabs: TabItem[];
};

function getDefaultIndex(tabs: TabItem[]): number {
  const defaultItem = tabs.find((i) => i.isDefault);
  if (defaultItem) {
    return defaultItem.key;
  }

  return tabs[0].key;
}

export default function CustomerTabs({ tabs }: CustomerTabsProps) {
  const [index, setIndex] = React.useState(getDefaultIndex(tabs));

  return (
    <Stack spacing={3}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <AppBar position="static" color="default">
          <Tabs
            value={index}
            onChange={(e, v) => setIndex(v)}
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
                {...a11yProps(key)}
              />
            ))}
          </Tabs>
        </AppBar>
      </Box>
      {tabs.map(({ key, children }) => (
        <TabPanel key={`tab-panel-${key}`} value={index} index={key}>
          <Box>
            <Grid>
              <Grid>{children}</Grid>
            </Grid>
          </Box>
        </TabPanel>
      ))}
    </Stack>
  );
}
