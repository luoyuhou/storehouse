import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { ChatContentItem } from "./chat.list";

export interface ChatMessagesProps {
  list: ChatContentItem[];
  currentType: "single" | "group";
  recipientId: string;
  selfId: string;
}

// eslint-disable-next-line react/function-component-definition
export const ChatMessages: React.FC<ChatMessagesProps> = ({
  list,
  currentType,
  recipientId,
  selfId,
}) => {
  if (!recipientId) {
    return (
      <Box
        sx={{
          height: 280,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "text.secondary",
          borderRadius: 1,
          border: "1px dashed",
          borderColor: "divider",
        }}
      >
        <Typography variant="body2">请选择左侧的联系人或群组开始聊天</Typography>
      </Box>
    );
  }

  const filtered = list.filter((item) => {
    if (currentType === "group") {
      return item.type === "group" && item.groupId === recipientId;
    }

    // 单聊：自己发出的消息里没有 recipientId 字段，这里主要过滤“对方发来的”消息；
    // 列表不大时不过滤也可以简单展示全部，这里做一个尽量合理的过滤：
    if (!item.isMe && item.senderId === recipientId) return true;
    if (item.isMe && item?.recipientId === recipientId) return true;
    return false;
  });

  return (
    <Box
      sx={{
        height: 280,
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        p: 2,
        mb: 2,
        overflowY: "auto",
        backgroundColor: "background.paper",
      }}
    >
      {filtered.map((item) => (
        <Stack
          key={item.key}
          direction="row"
          justifyContent={item.isMe ? "flex-end" : "flex-start"}
          sx={{ mb: 1.5 }}
        >
          <Box
            sx={{
              maxWidth: "80%",
              px: 1.5,
              py: 0.75,
              borderRadius: 1.5,
              bgcolor: item.isMe ? "primary.main" : "grey.100",
              color: item.isMe ? "primary.contrastText" : "text.primary",
            }}
          >
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              {item.isMe ? "我" : item.sender} · {item.datetime}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {item.message}
            </Typography>
          </Box>
        </Stack>
      ))}
      {!filtered.length && (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 8 }}>
          暂无聊天记录
        </Typography>
      )}
    </Box>
  );
};
