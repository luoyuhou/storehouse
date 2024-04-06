import React from "react";
import { Box, Tabs, Tab, Typography, Stack, Unstable_Grid2 as Grid } from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface VerticalTabsProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: VerticalTabsProps) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      style={{ width: "100%" }}
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </Box>
  );
}

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

type TabItem = {
  label: string | React.ReactNode;
  key: number;
  isDefault?: boolean;
  children: React.ReactNode;
};

export default function VerticalTabs(props: { tabs: TabItem[] }) {
  const { tabs } = props;
  const theme = useTheme();

  const classes = {
    root: {
      flexGrow: 1,
      backgroundColor: theme.palette.background.paper,
      display: "flex",
      // height: 500,
      overflow: "auto",
    },
    tabs: {
      borderRight: `1px solid ${theme.palette.divider}`,
    },
  };

  const [value, setValue] = React.useState<number>(0);

  const handleChange = (newValue: number) => {
    setValue(newValue);
  };

  return (
    <Stack spacing={3}>
      <Box style={classes.root}>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={value}
          onChange={(e, v) => handleChange(v)}
          aria-label="Vertical tabs example"
          style={classes.tabs}
        >
          {tabs.map((tab) => (
            <Tab label={tab.label} key={tab.key} {...a11yProps(tab.key)} />
          ))}
        </Tabs>
        {tabs.map(({ key, children }) => (
          <TabPanel key={`tab-panel-${key}`} value={value} index={key}>
            <Box>
              <Grid>
                <Grid>{children}</Grid>
              </Grid>
            </Box>
          </TabPanel>
        ))}
      </Box>
    </Stack>
  );
}
