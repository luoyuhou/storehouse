import React from "react";
import { Box, Button, SvgIcon, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { ChevronDoubleRightIcon } from "@heroicons/react/20/solid";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";
import { post } from "src/lib/http";

// eslint-disable-next-line import/no-extraneous-dependencies
const DynamicReactJson = dynamic(import("react-json-view"), { ssr: false });

export function ParseJsonComponent({
  setValue,
}: {
  setValue?: React.Dispatch<React.SetStateAction<Record<string, never> | Record<string, never>[]>>;
}) {
  const [serialise, setSerialise] = React.useState<string>("");
  const [json, setJson] = React.useState({});
  const onSerialise = () => {
    if (!serialise.trim()) {
      return;
    }
    post({ url: "/api/general/tools/deserialization", payload: {} }).catch();
    try {
      const obj = JSON.parse(serialise);
      setJson(obj);
      if (setValue && typeof setValue === "function") {
        setValue(Array.isArray(obj) ? obj : [obj]);
      }
    } catch (e) {
      if (setValue && typeof setValue === "function") {
        setValue([]);
      }
      toast.error((e as unknown as { message: string }).message);
    }
  };

  return (
    <Box sx={{ px: 2 }}>
      <Grid container spacing={3}>
        <Grid lg={12} md={12} xs={12}>
          <Typography align="center" color="primary" variant="h6" mb={2}>
            反序列化
          </Typography>
        </Grid>
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
            placeholder="placeholder..."
            value={serialise}
            onChange={(e) => setSerialise(e.target.value)}
          />
        </Grid>
        <Grid lg={1} md={2} xs={12}>
          <Grid container>
            <Grid lg={12} md={12} xs={12}>
              <Typography align="center" mt={1} mb={1}>
                <Button sx={{ border: "1px solid skyblue" }} onClick={() => onSerialise()}>
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
