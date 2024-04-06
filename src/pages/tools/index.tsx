import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import React from "react";
import Head from "next/head";
import { Box, Container, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ParseJsonPanel from "src/sections/tools/parse-json.panel";
import JsonToCsvPanel from "src/sections/tools/json-to-csv.panel";
import FileComparePanel from "src/sections/tools/file-compare.panel";
import CustomerTabs from "src/components/tabs/customer-tabs";
import CsvToJsonPanel from "src/sections/tools/csv-to-json.panel";
import ImageToSvg from "src/sections/tools/image-to-svg";

function Tools() {
  const theme = useTheme();

  return (
    <>
      <Head>
        <title>Tools</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 1,
        }}
      >
        <Container style={{ maxWidth: "1400px" }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4">工具箱</Typography>
            </Box>
            <Box sx={{ backgroundColor: theme.palette.background.paper }}>
              <CustomerTabs
                tabs={[
                  { key: 0, label: "Parse Json", isDefault: false, children: <ParseJsonPanel /> },
                  { key: 1, label: "Json2CSV", children: <JsonToCsvPanel /> },
                  { key: 2, label: "CSV2Json", children: <CsvToJsonPanel /> },
                  {
                    key: 3,
                    label: "File Compare",
                    children: <FileComparePanel />,
                  },
                  { key: 4, label: "Image2Svg", isDefault: true, children: <ImageToSvg /> },
                ]}
              />
            </Box>
          </Stack>
        </Container>
      </Box>
    </>
  );
}

Tools.getLayout = (page: JSX.Element) => <DashboardLayout>{page}</DashboardLayout>;

export default Tools;
