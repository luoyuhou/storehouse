import React from "react";
import { Box, Grid, Typography } from "@mui/material";

export type ChatContentItem = {
  key: string;
  datetime: string;
  senderId: string;
  sender: string;
  message: string;
  isMe: boolean;
};

export default function ChatList({ list }: { list: ChatContentItem[] }) {
  return (
    <Box height="300px" className="border rounded-md p-4" style={{ overflow: "scroll" }}>
      {list.map((item) => {
        return (
          <Box key={item.key} className="border-b">
            {item.isMe && (
              <Box className="text-right">
                <Grid>
                  <Typography>{item.sender}</Typography>
                  <Typography className="text-gray-500">{item.datetime}</Typography>
                </Grid>
                <Typography>{item.message}</Typography>
              </Box>
            )}
            {!item.isMe && (
              <Box className="border-b">
                <Grid>
                  <Typography>{item.sender}</Typography>
                  <Typography className="text-gray-500">{item.datetime}</Typography>
                </Grid>
                <Typography>{item.message}</Typography>
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
