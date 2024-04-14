import React from "react";
import { Typography, Box, Grid, Button } from "@mui/material";
import { post } from "src/lib/http";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Diff = require("diff");

type DiffDataType = {
  added: boolean;
  removed: boolean;
  value: string;
};

const getColor = (added: boolean, removed: boolean) => {
  if (added) {
    return "bg-green-400";
  }

  return removed ? "bg-red-400" : "bg-grey-400";
};

const compare = ({ target, result }: { target: string; result: string }) => {
  return Diff.diffChars(target, result);
};

function RenderDiff({ output }: { output: DiffDataType[] }) {
  if (!output.length) {
    return null;
  }

  const rows: { value: string; color: string }[][] = [];
  let index = 0;
  let isMinus = false;

  output.forEach(({ added, removed, value }: DiffDataType) => {
    // eslint-disable-next-line no-nested-ternary
    const color = getColor(added, removed);
    // debugger;
    const idx = value.indexOf("\n");
    if (!rows[index]) {
      rows[index] = [];
    }
    if (idx === -1) {
      rows[index].push({ value, color });
      return;
    }

    const arr = value.split("\n");

    const len = arr.length;
    const elements: string[] = [];
    arr.forEach((r, i) => {
      if (i <= len - 2 && r && arr[i + 1]) {
        elements.push(...[r, ""]);
        return;
      }

      if (i <= len - 2 && !r && !arr[i + 1] && !isMinus) {
        isMinus = true;
        return;
      }
      elements.push(r);
    });

    elements.forEach((s) => {
      if (s === "") {
        index += 1;
      }

      if (!rows[index]) {
        rows[index] = [];
      }

      if (!s) {
        return;
      }

      rows[index].push({ value: s, color });
    });
  });

  return (
    <>
      {rows.map((row, idx) => {
        const key1 = `div-${idx}`;
        return (
          <div key={key1} className="flex">
            <span
              className="text-right"
              style={{ backgroundColor: "gray", padding: "0 3px", color: "white", width: "50px" }}
            >
              {idx + 1}
            </span>
            {row.map(({ value, color }, i) => {
              const key2 = `span-${idx}-${i}`;
              return (
                <span key={key2} className={color}>
                  {value}
                </span>
              );
            })}
          </div>
        );
      })}
    </>
  );
}

export default function FileComparePanel() {
  const [file1, setFile1] = React.useState("");
  const [file2, setFile2] = React.useState("");
  const [diffData, setDiffData] = React.useState<DiffDataType[]>([]);

  return (
    <Box sx={{ px: 2 }}>
      <Grid container spacing={3}>
        <Grid lg={4} md={4} xs={12}>
          <Typography align="center" color="primary" variant="h6" mb={2}>
            File 1
          </Typography>
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
            value={file1}
            onChange={(e) => setFile1(e.target.value)}
          />
        </Grid>
        <Grid lg={4} md={4} xs={12}>
          <Typography align="center" color="primary" variant="h6" mb={2}>
            File 2
          </Typography>
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
            value={file2}
            onChange={(e) => setFile2(e.target.value)}
          />
        </Grid>
        <Grid lg={4} md={4} xs={12}>
          <Typography align="center" color="primary" variant="h6">
            Diff
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={() => {
                post({ url: "/api/general/tools/file-compare", payload: {} }).catch();
                setDiffData(compare({ target: file1, result: file2 }));
              }}
              sx={{ marginLeft: "2rem" }}
            >
              Run
            </Button>
          </Typography>
          <Box sx={{ border: "1px solid blue", minHeight: "300px", borderRadius: "5px" }}>
            <RenderDiff output={diffData} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
