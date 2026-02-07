import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import React from "react";
import Head from "next/head";
import { Box, Container, Stack, Typography, SvgIcon } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import WrenchScrewdriverIcon from "@heroicons/react/24/solid/WrenchScrewdriverIcon";
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
          py: 3,
          background:
            theme.palette.mode === "light"
              ? `radial-gradient(circle at top, ${theme.palette.primary.main}11 0, transparent 55%)`
              : undefined,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <SvgIcon color="primary">
                  <WrenchScrewdriverIcon />
                </SvgIcon>
                <Typography variant="h4">工具箱</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                常用开发者小工具，支持 JSON 解析、CSV 转换、文件对比与图片转 SVG 等。
              </Typography>
            </Box>
            <Box
              sx={{
                backgroundColor: theme.palette.background.paper,
                borderRadius: 3,
                boxShadow: 3,
                p: { xs: 2, md: 3 },
              }}
            >
              <CustomerTabs
                tabs={[
                  { key: 0, label: "JSON 解析", isDefault: false, children: <ParseJsonPanel /> },
                  { key: 1, label: "JSON 转 CSV", children: <JsonToCsvPanel /> },
                  { key: 2, label: "CSV 转 JSON", children: <CsvToJsonPanel /> },
                  {
                    key: 3,
                    label: "文件对比",
                    children: <FileComparePanel />,
                  },
                  { key: 4, label: "图片转 SVG", isDefault: true, children: <ImageToSvg /> },
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
