import React from "react";
import { Box, Button, SvgIcon, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { ChevronDoubleLeftIcon } from "@heroicons/react/20/solid";
import { toast } from "react-toastify";
import { ParseJsonComponent } from "src/sections/tools/parse-json.component";

export default function ParseJsonPanel() {
  const [deserialization, setDeserialization] = React.useState("");
  const [code, setCode] = React.useState("");

  const onDeserialization = () => {
    if (!deserialization.trim()) {
      return;
    }
    try {
      const obj = JSON.parse(deserialization);
      setCode(JSON.stringify(obj));
    } catch (e) {
      toast.error((e as unknown as { message: string }).message);
    }
  };

  return (
    <Box sx={{ px: 2 }}>
      <ParseJsonComponent />

      <hr />

      <Grid container spacing={3} mt={2}>
        <Grid lg={12} md={12} xs={12}>
          <Typography align="center" color="primary" variant="h6" mb={2}>
            序列化
          </Typography>
        </Grid>
        <Grid lg={5.5} md={5} xs={12}>
          <pre style={{ border: "1px solid skyblue", minHeight: "300px", margin: "0px" }}>
            <code>{code}</code>
          </pre>
        </Grid>
        <Grid lg={1} md={2} xs={12}>
          <Grid container>
            <Grid lg={12} md={12} xs={12} mt={1} mb={1}>
              <Typography align="center">
                <Button sx={{ border: "1px solid skyblue" }} onClick={() => onDeserialization()}>
                  <SvgIcon fontSize="small">
                    <ChevronDoubleLeftIcon />
                  </SvgIcon>
                </Button>
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid lg={5.5} md={5} xs={12}>
          <textarea
            style={{
              width: "100%",
              border: "1px solid blue",
              borderRadius: "5px",
              minHeight: "300px",
              padding: "5px",
            }}
            placeholder="placeholder..."
            value={deserialization}
            onChange={(e) => setDeserialization(e.target.value)}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
