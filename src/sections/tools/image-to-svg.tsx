import React, { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { post } from "src/lib/http";

export default function ImageToSvg() {
  const [filename, setFilename] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [svgUrl, setSvgUrl] = useState("#");

  return (
    <Box sx={{ px: 2 }}>
      <Box>
        <Typography align="left" color="primary" variant="h6" mb={2}>
          Image to SVG
        </Typography>
      </Box>
      <Box>
        <Box>
          <input
            type="file"
            id="upload"
            accept="image/png"
            onChange={(e) => {
              const file = (e.target?.files as unknown as File[])?.[0];
              if (!file) {
                return;
              }

              setFilename(file.name.split(".")[0]);

              const reader = new FileReader();

              reader.readAsDataURL(file);

              reader.addEventListener("load", (ev) => {
                const dataURL = (ev.target as { result: string }).result;

                const svgCode = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="120" height="120"><image xlink:href="${dataURL}" height="120" width="120"/></svg>`;
                const blob = new Blob([svgCode], { type: "image/svg+xml" });

                const url = URL.createObjectURL(blob);

                setFileUrl(url);
                setSvgUrl(url);
              });
            }}
          />
        </Box>

        {fileUrl ? <img className="avatar" src={fileUrl} alt="Avatar Preview" /> : null}

        <Button
          disabled={!fileUrl}
          className="download-button"
          onClick={() => {
            post({ url: "/api/general/tools/image-to-svg", payload: {} }).catch();
          }}
        >
          <a href={svgUrl} download={`${filename}.svg`}>
            下载 SVG
          </a>
        </Button>
      </Box>
    </Box>
  );
}
