/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useState } from "react";
import { Box, Button, TextareaAutosize } from "@mui/material";
import { UserSessionType } from "src/types/users";

type ChatInputProps = { socket: any; user: UserSessionType };

export default function ChatInput({ socket, user }: Readonly<ChatInputProps>) {
  const [inputValue, setInputValue] = useState<string>("");

  const onSend = useCallback((value: string) => {
    socket.emit("sendMessage", {
      senderId: user.id,
      sender: `${user.first_name}${user.last_name}`,
      message: value,
    });
  }, []);

  return (
    <Box className="mt-3">
      <TextareaAutosize
        className="border p-4 rounded-md"
        aria-label="empty textarea"
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
          disabled={!inputValue.trim()}
          onClick={() => onSend(inputValue)}
        >
          发送
        </Button>
      </Box>
    </Box>
  );
}
