/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useState } from "react";
import { Box, Button, TextareaAutosize } from "@mui/material";
import { UserSessionType } from "src/types/users";

export type BaseChatInputProps = {
  socket: any;
  user: UserSessionType;
  recipientId: string;
};

export function SingleChatInput({ socket, user, recipientId }: Readonly<BaseChatInputProps>) {
  const [inputValue, setInputValue] = useState<string>("");

  const onSend = useCallback(
    (value: string) => {
      const payload: any = {
        senderId: user.id,
        sender: `${user.first_name}${user.last_name}`,
        message: value,
        type: "single" as const,
        recipientId,
      };

      socket.emit("sendMessage", payload);
      setInputValue("");
    },
    [recipientId, socket, user.first_name, user.id, user.last_name],
  );

  return (
    <Box className="mt-3">
      <TextareaAutosize
        className="border p-4 rounded-md"
        aria-label="single-chat-textarea"
        placeholder="请输入..."
        style={{ width: "100%" }}
        value={inputValue}
        onChange={(v: { target: { value: string } }) => setInputValue(v.target.value)}
      />
      <Box className="text-right mt-2">
        <Button
          style={{ width: "49%", marginLeft: "2%" }}
          variant="contained"
          color="primary"
          disabled={!inputValue.trim() || !recipientId}
          onClick={() => onSend(inputValue)}
        >
          发送
        </Button>
      </Box>
    </Box>
  );
}

export function GroupChatInput({ socket, user, recipientId }: Readonly<BaseChatInputProps>) {
  const [inputValue, setInputValue] = useState<string>("");

  const onSend = useCallback(
    (value: string) => {
      const payload: any = {
        senderId: user.id,
        sender: `${user.first_name}${user.last_name}`,
        message: value,
        type: "group" as const,
        groupId: recipientId,
      };

      socket.emit("sendMessage", payload);
      setInputValue("");
    },
    [recipientId, socket, user.first_name, user.id, user.last_name],
  );

  return (
    <Box className="mt-3">
      <TextareaAutosize
        className="border p-4 rounded-md"
        aria-label="group-chat-textarea"
        placeholder="请输入..."
        style={{ width: "100%" }}
        value={inputValue}
        onChange={(v: { target: { value: string } }) => setInputValue(v.target.value)}
      />
      <Box className="text-right mt-2">
        <Button
          style={{ width: "49%", marginLeft: "2%" }}
          variant="contained"
          color="primary"
          disabled={!inputValue.trim() || !recipientId}
          onClick={() => onSend(inputValue)}
        >
          发送
        </Button>
      </Box>
    </Box>
  );
}

export default SingleChatInput;
