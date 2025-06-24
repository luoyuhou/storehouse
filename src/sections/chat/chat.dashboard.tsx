/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import Dialog from "@mui/material/Dialog";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
import List from "@mui/material/List";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import { Box, MenuItem, Select, Unstable_Grid2 as Grid } from "@mui/material";
import { useState } from "react";
import ChatInput from "src/sections/chat/chat.input";
import { UserSessionType } from "src/types/users";
import ChatList, { ChatContentItem } from "./chat.list";

type ChatDashboardProps = {
  user: UserSessionType;
  socket: any;
  chatList: ChatContentItem[];
  open: Readonly<boolean>;
  toggle: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function ChatDashboard({
  user,
  socket,
  chatList,
  open,
  toggle,
}: Readonly<ChatDashboardProps>) {
  const [type, setType] = useState<"single" | "group">("single");
  const [recipientId, setRecipientId] = useState<string>("");

  return (
    <Dialog fullWidth maxWidth="xl" open={open}>
      <AppBar sx={{ position: "sticky", top: "0px" }}>
        <Toolbar className="flex justify-between content-between">
          <Typography sx={{ ml: 2 }} variant="h6" component="div">
            联系
          </Typography>
          <Typography sx={{ ml: 2 }} variant="h6" component="div">
            {recipientId}
          </Typography>
          <IconButton edge="start" color="inherit" onClick={() => toggle(false)} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <List className="flex border-b" style={{ padding: "4px" }}>
        <ListItemButton onClick={() => setType("single")}>
          <ListItemText
            primary="单人"
            className={`text-center py-1 ${type === "single" ? " active: bg-blue-300" : ""}`}
            style={{ margin: "0px" }}
          />
        </ListItemButton>
        <Box className="border-r" />
        <ListItemButton onClick={() => setType("group")}>
          <ListItemText
            primary="群组"
            className={`text-center py-1 ${type === "group" ? " active: bg-blue-300" : ""}`}
            style={{ margin: "0px" }}
          />
        </ListItemButton>
      </List>

      <Box className="p-5">
        {type === "single" && (
          <Box>
            <Grid>
              <ChatList list={chatList} setSingleUser={setRecipientId} />
              <ChatInput
                socket={socket}
                user={user}
                recipientId={recipientId}
                setRecipientId={setRecipientId}
              />
            </Grid>
          </Box>
        )}
        {type === "group" && (
          <Box>
            <Grid>
              <ChatList list={chatList} setSingleUser={setRecipientId} />
              <ChatInput
                socket={socket}
                user={user}
                recipientId={recipientId}
                setRecipientId={setRecipientId}
              />
            </Grid>
          </Box>
        )}
      </Box>
    </Dialog>
  );
}
