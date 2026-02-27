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
import { Box, Unstable_Grid2 as Grid } from "@mui/material";
import { useEffect, useState } from "react";
import SingleChatInput, { GroupChatInput } from "src/sections/chat/chat.input";
import { UserEntity, UserSessionType } from "src/types/users";
import { get } from "src/lib/http";
import { toast } from "react-toastify";
import ChatList, { ChatContentItem } from "./chat.list";
import { UserInfoDialog } from "./user-info.dialog";
import { ChatMessages } from "./chat.messages";
import { ContactDialog } from "./contact-dialog";
import { CreateGroupDialog } from "./create-group-dialog";

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
  const [recipientName, setRecipientName] = useState<string>("");
  const [userInfoOpen, setUserInfoOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserEntity | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [createGroupDialogOpen, setCreateGroupDialogOpen] = useState(false);
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);

  const handleUserClick = (userId: string) => {
    get<UserEntity>(`/api/users/${userId}`)
      .then((res) => {
        setUserInfo(res);
        setUserInfoOpen(true);
      })
      .catch((err: any) => {
        toast.error(err?.message || "加载用户信息失败");
      });
  };

  useEffect(() => {
    if (!open || type !== "group") return;

    get<{ groupId: string; name: string }[] | { data?: { groupId: string; name: string }[] }>(
      "/api/chat/groups",
    )
      .then((res) => {
        const data = (res as any).data || res;
        if (Array.isArray(data)) {
          setGroups(
            data.map((g) => ({
              id: g.groupId,
              name: g.name,
            })),
          );
        }
      })
      .catch((err: any) => {
        toast.error(err?.message || "加载群聊列表失败");
      });
  }, [open, type]);

  return (
    <Dialog fullWidth maxWidth="xl" open={open}>
      <AppBar sx={{ position: "sticky", top: "0px" }}>
        <Toolbar className="flex justify-between content-between">
          <Typography sx={{ ml: 2 }} variant="h6" component="div">
            联系
          </Typography>
          <Typography sx={{ ml: 2 }} variant="h6" component="div">
            {recipientName || recipientId}
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
          <Grid container spacing={2}>
            <Grid xs={12} md={4}>
              <ChatList
                list={chatList}
                setSingleUser={setRecipientId}
                setRecipientName={setRecipientName}
                onUserClick={handleUserClick}
                currentType="single"
              />
              <Box mt={2}>
                <button
                  type="button"
                  className="w-full border rounded-md py-1 text-sm hover:bg-gray-50"
                  onClick={() => setContactDialogOpen(true)}
                >
                  联系人
                </button>
              </Box>
            </Grid>
            <Grid xs={12} md={8}>
              <ChatMessages
                list={chatList}
                currentType="single"
                recipientId={recipientId}
                selfId={user?.id}
              />
              <SingleChatInput socket={socket} user={user} recipientId={recipientId} />
            </Grid>
          </Grid>
        )}
        {type === "group" && (
          <Grid container spacing={2}>
            <Grid xs={12} md={4}>
              <ChatList
                list={chatList}
                setSingleUser={setRecipientId}
                setRecipientName={setRecipientName}
                onUserClick={handleUserClick}
                currentType="group"
                extraGroups={groups}
              />
              <Box mt={2}>
                <button
                  type="button"
                  className="w-full border rounded-md py-1 text-sm hover:bg-gray-50"
                  onClick={() => setCreateGroupDialogOpen(true)}
                >
                  创建群聊
                </button>
              </Box>
            </Grid>
            <Grid xs={12} md={8}>
              <ChatMessages
                list={chatList}
                currentType="group"
                recipientId={recipientId}
                selfId={user.id}
              />
              <GroupChatInput socket={socket} user={user} recipientId={recipientId} />
            </Grid>
          </Grid>
        )}
      </Box>
      <UserInfoDialog open={userInfoOpen} onClose={() => setUserInfoOpen(false)} user={userInfo} />
      <ContactDialog
        open={contactDialogOpen}
        onClose={() => setContactDialogOpen(false)}
        onSelect={(userInfoItem) => {
          const id = userInfoItem.user_id ?? String(userInfoItem.id);
          setRecipientId(id);
          setRecipientName(`${userInfoItem.first_name}${userInfoItem.last_name}`);
        }}
      />
      <CreateGroupDialog
        open={createGroupDialogOpen}
        onClose={() => setCreateGroupDialogOpen(false)}
        onCreated={(group) => {
          setRecipientId(group.groupId);
          setRecipientName(group.name);
          setGroups((prev) => {
            if (prev.some((g) => g.id === group.groupId)) {
              return prev;
            }
            return [...prev, { id: group.groupId, name: group.name }];
          });
        }}
      />
    </Dialog>
  );
}
