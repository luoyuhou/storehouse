/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";
import { toast } from "react-toastify";
import { get } from "src/lib/http";
import { UserEntity } from "src/types/users";

export type ContactDialogProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (user: UserEntity) => void;
};

export function ContactDialog({ open, onClose, onSelect }: Readonly<ContactDialogProps>) {
  const [users, setUsers] = useState<UserEntity[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");

  useEffect(() => {
    if (!open) return;

    get<UserEntity[]>("/api/users")
      .then((res) => {
        setUsers(res || []);
      })
      .catch((err: any) => {
        toast.error(err?.message || "加载用户列表失败");
      });
  }, [open]);

  const handleConfirm = () => {
    if (!selectedId) {
      toast.error("请选择联系人");
      return;
    }
    const user = users.find((u) => (u.user_id ?? String(u.id)) === selectedId);
    if (!user) {
      toast.error("联系人不存在");
      return;
    }
    onSelect(user);
    onClose();
    setSelectedId("");
  };

  const handleClose = () => {
    onClose();
    setSelectedId("");
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <DialogTitle>选择联系人</DialogTitle>
      <DialogContent>
        <DialogContentText>请选择要开始聊天的联系人（按用户名区分）。</DialogContentText>
        <TextField
          select
          fullWidth
          margin="dense"
          label="联系人"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          {users.map((u) => (
            <MenuItem key={u.user_id ?? u.id} value={u.user_id ?? String(u.id)}>
              {u.first_name}
              {u.last_name}（{u.phone}）
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>取消</Button>
        <Button onClick={handleConfirm}>确定</Button>
      </DialogActions>
    </Dialog>
  );
}
