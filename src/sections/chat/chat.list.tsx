import React from "react";
import { Avatar, Box, Grid, ListItemButton, Stack, Typography } from "@mui/material";

export type ChatContentItem = {
  key: string;
  datetime: string;
  senderId: string;
  sender: string;
  message: string;
  isMe: boolean;
  isRead?: boolean;
  type?: "single" | "group";
  groupId?: string;
  groupName?: string;
  recipientId?: string; // 单聊时的目标用户，用于会话过滤
};

type ConversationItem = {
  id: string;
  name: string;
  type: "single" | "group";
  unread: number;
  lastDatetime: string;
};

export default function ChatList({
  list,
  setSingleUser,
  setRecipientName,
  onUserClick,
  currentType,
  extraGroups,
}: {
  list: ChatContentItem[];
  setSingleUser: React.Dispatch<React.SetStateAction<string>>;
  setRecipientName: React.Dispatch<React.SetStateAction<string>>;
  onUserClick?: (userId: string) => void;
  currentType: "single" | "group";
  extraGroups?: { id: string; name: string }[];
}) {
  const conversationMap = new Map<string, ConversationItem>();

  list.forEach((item) => {
    const isGroup = item.type === "group" && item.groupId;

    if (currentType === "group") {
      if (!isGroup || !item.groupId) return;
      const key = `group:${item.groupId}`;
      const existed = conversationMap.get(key);
      const unread = !item.isRead && !item.isMe ? 1 : 0;
      const base: ConversationItem = {
        id: item.groupId,
        name: item.groupName || `群组 ${item.groupId}`,
        type: "group",
        unread: 0,
        lastDatetime: item.datetime,
      };
      if (!existed) {
        conversationMap.set(key, { ...base, unread });
      } else {
        conversationMap.set(key, {
          ...existed,
          unread: existed.unread + unread,
          lastDatetime: item.datetime > existed.lastDatetime ? item.datetime : existed.lastDatetime,
        });
      }
      return;
    }

    // 单人模式：只统计对方发来的消息，按 sender 聚合
    if (isGroup) return;
    if (item.isMe) return;

    const key = `single:${item.senderId}`;
    const existed = conversationMap.get(key);
    const unread = !item.isRead ? 1 : 0;
    const base: ConversationItem = {
      id: item.senderId,
      name: item.sender,
      type: "single",
      unread: 0,
      lastDatetime: item.datetime,
    };

    if (!existed) {
      conversationMap.set(key, { ...base, unread });
    } else {
      conversationMap.set(key, {
        ...existed,
        unread: existed.unread + unread,
        lastDatetime: item.datetime > existed.lastDatetime ? item.datetime : existed.lastDatetime,
      });
    }
  });

  if (currentType === "group" && extraGroups && extraGroups.length) {
    extraGroups.forEach((g) => {
      const key = `group:${g.id}`;
      if (!conversationMap.has(key)) {
        conversationMap.set(key, {
          id: g.id,
          name: g.name || `群组 ${g.id}`,
          type: "group",
          unread: 0,
          lastDatetime: "",
        });
      }
    });
  }

  const conversations = Array.from(conversationMap.values()).sort((a, b) =>
    a.lastDatetime < b.lastDatetime ? 1 : -1,
  );

  return (
    <Box height="300px" className="border rounded-md p-4" style={{ overflow: "scroll" }}>
      {conversations.map((conv) => {
        const isGroup = conv.type === "group";
        return (
          <Box key={conv.id} className="border-b py-2">
            <ListItemButton
              onClick={() => {
                setSingleUser(conv.id);
                setRecipientName(conv.name);
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center" sx={{ width: "100%" }}>
                {isGroup ? (
                  <Avatar sx={{ width: 32, height: 32 }}>群</Avatar>
                ) : (
                  <Avatar
                    sx={{ width: 32, height: 32, cursor: "pointer" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onUserClick?.(conv.id);
                    }}
                  >
                    {conv.name?.[0]}
                  </Avatar>
                )}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2">{conv.name}</Typography>
                  <Typography variant="caption" className="text-gray-500">
                    {conv.unread > 0 ? `未读 ${conv.unread} 条` : "暂无未读消息"}
                  </Typography>
                </Box>
              </Stack>
            </ListItemButton>
          </Box>
        );
      })}
      {!conversations.length && (
        <Typography variant="body2" color="text.secondary" align="center">
          暂无会话
        </Typography>
      )}
    </Box>
  );
}
