import React from "react";
import Grid from "@mui/material/Grid";
import { Box, Button, SvgIcon, Typography } from "@mui/material";
import { ChevronDoubleRightIcon } from "@heroicons/react/20/solid";
import dynamic from "next/dynamic";
import Utils from "src/lib/utils";
import { FileInputType } from "src/constant/tools.const";

// eslint-disable-next-line import/no-extraneous-dependencies
const DynamicReactJson = dynamic(import("react-json-view"), { ssr: false });

export default function InputCsvDataToJsonComponent() {
  const [value, setValue] = React.useState<string>("");
  const [json, setJson] = React.useState({});

  return (
    <Box sx={{ px: 2 }}>
      <Grid container spacing={3}>
        <Grid lg={5.5} md={5} xs={12}>
          <textarea
            style={{
              width: "100%",
              border: "1px solid blue",
              borderRadius: "5px",
              minHeight: "300px",
              maxHeight: "500px",
              padding: "5px",
            }}
            placeholder="separator: csv => ','"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </Grid>
        <Grid lg={1} md={2} xs={12}>
          <Grid container>
            <Grid lg={12} md={12} xs={12}>
              <Typography align="center" mt={1} mb={1}>
                <Button
                  sx={{ border: "1px solid skyblue" }}
                  onClick={() => setJson(Utils.onInputTransToJson(value, FileInputType.csv))}
                >
                  <SvgIcon fontSize="small">
                    <ChevronDoubleRightIcon />
                  </SvgIcon>
                </Button>
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid lg={5.5} md={5} xs={12} maxHeight="500px" sx={{ overflow: "scroll" }}>
          <Box border="1px solid skyblue" borderRadius="5px" minHeight="300px">
            <DynamicReactJson src={json} theme="apathy:inverted" onEdit={() => true} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
