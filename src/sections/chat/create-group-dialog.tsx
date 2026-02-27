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
import { get, post } from "src/lib/http";
import { UserEntity } from "src/types/users";

export type CreateGroupDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (group: { groupId: string; name: string; memberIds: string[] }) => void;
};

export function CreateGroupDialog({ open, onClose, onCreated }: Readonly<CreateGroupDialogProps>) {
  const [users, setUsers] = useState<UserEntity[]>([]);
  const [groupName, setGroupName] = useState("");
  const [memberIds, setMemberIds] = useState<string[]>([]);

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

  const handleClose = () => {
    onClose();
    setGroupName("");
    setMemberIds([]);
  };

  const handleConfirm = async () => {
    if (!groupName.trim()) {
      toast.error("请输入群聊名称");
      return;
    }
    if (!memberIds.length) {
      toast.error("请选择至少一位群成员");
      return;
    }

    try {
      const res = await post<
        { groupId: string; name: string } | { data?: { groupId: string; name: string } }
      >({
        url: "/api/chat/groups",
        payload: {
          name: groupName.trim(),
          memberIds,
        },
      });

      const data = (res as any).data || res;

      if (!data?.groupId) {
        throw new Error("创建群聊失败");
      }

      onCreated({ groupId: data.groupId, name: data.name, memberIds });
      toast.success("创建群聊成功");
      handleClose();
    } catch (e: any) {
      toast.error(e?.message || "创建群聊失败");
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <DialogTitle>创建群聊</DialogTitle>
      <DialogContent>
        <DialogContentText>请输入群聊名称，并选择群成员（可多选）。</DialogContentText>
        <TextField
          fullWidth
          margin="dense"
          label="群聊名称"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <TextField
          select
          fullWidth
          margin="dense"
          label="群成员"
          SelectProps={{ multiple: true }}
          value={memberIds}
          onChange={(e) => {
            const { value } = e.target;
            setMemberIds(typeof value === "string" ? value.split(",") : value);
          }}
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
        <Button onClick={handleConfirm}>创建</Button>
      </DialogActions>
    </Dialog>
  );
}
