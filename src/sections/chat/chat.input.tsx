/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  TextareaAutosize,
} from "@mui/material";
import { UserSessionType } from "src/types/users";

type ChatInputProps = {
  socket: any;
  user: UserSessionType;
  recipientId: string;
  setRecipientId: React.Dispatch<React.SetStateAction<string>>;
};

export default function ChatInput({
  socket,
  user,
  recipientId,
  setRecipientId,
}: Readonly<ChatInputProps>) {
  const [val, setVal] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");
  const [inputRecipientModal, setInputRecipientModal] = useState(false);

  const onSend = useCallback(
    (value: string) => {
      socket.emit("sendMessage", {
        senderId: user.id,
        sender: `${user.first_name}${user.last_name}`,
        recipientId,
        message: value,
      });
    },
    [recipientId],
  );

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
        {recipientId ? (
          <Button
            style={{ width: "49%", marginLeft: "2%" }}
            variant="contained"
            color="primary"
            disabled={!inputValue.trim()}
            onClick={() => onSend(inputValue)}
          >
            发送
          </Button>
        ) : (
          <Button
            style={{ width: "49%", marginLeft: "2%" }}
            variant="contained"
            color="primary"
            onClick={() => setInputRecipientModal(true)}
          >
            收信人
          </Button>
        )}
      </Box>
      <Dialog open={inputRecipientModal} onClose={() => setInputRecipientModal(false)} fullWidth>
        <DialogTitle>收信人</DialogTitle>
        <DialogContent>
          <DialogContentText>请输入收信人的ID</DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="id"
            name="id"
            label="id"
            type="text"
            fullWidth
            variant="standard"
            value={val}
            onChange={(e) => setVal(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInputRecipientModal(false)}>取消</Button>
          <Button
            type="submit"
            onClick={() => {
              setRecipientId(val);
              setInputRecipientModal(false);
            }}
          >
            确定
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
