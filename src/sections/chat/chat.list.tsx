import React from "react";
import { Box, Grid, ListItemButton, Typography } from "@mui/material";

export type ChatContentItem = {
  key: string;
  datetime: string;
  senderId: string;
  sender: string;
  message: string;
  isMe: boolean;
  isRead?: boolean;
};

export default function ChatList({
  list,
  setSingleUser,
}: {
  list: ChatContentItem[];
  setSingleUser: React.Dispatch<React.SetStateAction<string>>;
}) {
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
                <ListItemButton onClick={() => setSingleUser(item.senderId)}>
                  <Box>
                    <Grid>
                      <Typography>{item.sender}</Typography>
                      <Typography className="text-gray-500">{item.datetime}</Typography>
                    </Grid>
                    <Typography>{item.message}</Typography>
                  </Box>
                </ListItemButton>
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
