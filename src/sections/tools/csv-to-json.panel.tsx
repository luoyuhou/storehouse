import { Box, Typography } from "@mui/material";
import React from "react";
import VerticalTabs from "src/components/tabs/vertical-tabs";
import InputCsvDataToJsonComponent from "src/sections/tools/csv-to-json/input-csv-data-to-json.component";
import CsvFileToJsonComponent from "src/sections/tools/csv-to-json/csv-file-to-json.component";

export default function CsvToJsonPanel() {
  return (
    <Box>
      <Box>
        <VerticalTabs
          tabs={[
            {
              key: 0,
              label: "CSV Data",
              isDefault: true,
              children: <InputCsvDataToJsonComponent />,
            },
            {
              key: 1,
              label: <Typography sx={{ marginRight: "2rem", width: "70px" }}>CSV File</Typography>,
              children: <CsvFileToJsonComponent />,
            },
          ]}
        />
      </Box>

      <Box />
    </Box>
  );
}
