import React from "react";
import { Box, Button, SvgIcon, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { ArrowUpCircleIcon, ChevronDoubleRightIcon } from "@heroicons/react/20/solid";
import dynamic from "next/dynamic";
import { FileInputType } from "src/constant/tools.const";
import Utils from "src/lib/utils";

// eslint-disable-next-line import/no-extraneous-dependencies
const DynamicReactJson = dynamic(import("react-json-view"), { ssr: false });

export default function CsvFileToJsonComponent() {
  const [file, setFile] = React.useState<File | undefined>(undefined);
  const [fileData, setFileData] = React.useState("");
  const [json, setJson] = React.useState({});

  return (
    <Box sx={{ px: 2 }}>
      <Grid container spacing={3}>
        <Grid sx={{ overflow: "hidden" }} lg={5.5} md={5} xs={12}>
          <input
            accept="text/csv"
            style={{ display: "none" }}
            id="contained-button-file"
            type="file"
            onChange={(e) => {
              const innerFile = e.target.files?.[0];
              setFile(innerFile);
              if (!innerFile) {
                setFileData("");
                return;
              }

              const reader = new FileReader();
              reader.readAsText(innerFile);
              reader.onloadend = ({ target }) => {
                setFileData(target?.result as string);
              };
            }}
          />
          <label htmlFor="contained-button-file">
            <Box>
              <Button variant="contained" color="primary" component="span">
                <SvgIcon fontSize="small">
                  <ArrowUpCircleIcon />
                </SvgIcon>
                &nbsp; Upload
              </Button>
            </Box>
            {file ? (
              <Box sx={{ marginTop: "2rem" }}>
                <Typography>File Name: {file.name}</Typography>
                <Typography>File Size: {((file?.size ?? 0) / 1024).toFixed(2)} KB</Typography>
                <Typography>File Type: {file.type}</Typography>
              </Box>
            ) : null}
          </label>
        </Grid>
        <Grid lg={1} md={2} xs={12}>
          <Grid container>
            <Grid lg={12} md={12} xs={12}>
              <Typography align="center" mt={1} mb={1}>
                <Button
                  sx={{ border: "1px solid skyblue" }}
                  onClick={() => setJson(Utils.onInputTransToJson(fileData, FileInputType.csv))}
                >
                  <SvgIcon fontSize="small">
                    <ChevronDoubleRightIcon />
                  </SvgIcon>
                </Button>
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid
          lg={5.5}
          md={5}
          xs={12}
          maxHeight="500px"
          maxWidth="500px"
          sx={{ overflow: "scroll" }}
        >
          <Box border="1px solid skyblue" borderRadius="5px" minHeight="300px" minWidth="300px">
            <DynamicReactJson src={json} theme="apathy:inverted" onEdit={() => true} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
