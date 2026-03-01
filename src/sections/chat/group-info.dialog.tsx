/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  Stack,
} from "@mui/material";
import { toast } from "react-toastify";
import { get } from "src/lib/http";

export type GroupMember = {
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
  avatar?: string | null;
};

export interface GroupInfoDialogProps {
  open: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
}

// eslint-disable-next-line react/function-component-definition
export const GroupInfoDialog: React.FC<GroupInfoDialogProps> = ({
  open,
  onClose,
  groupId,
  groupName,
}) => {
  const [members, setMembers] = useState<GroupMember[]>([]);

  useEffect(() => {
    if (!open || !groupId) return;

    get<GroupMember[] | { data?: GroupMember[] }>(`/api/chat/groups/${groupId}/members`)
      .then((res) => {
        const data = (res as any).data || res;
        if (Array.isArray(data)) {
          setMembers(data);
        } else {
          setMembers([]);
        }
      })
      .catch((err: any) => {
        toast.error(err?.message || "加载群成员失败");
      });
  }, [open, groupId]);

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>群信息</DialogTitle>
      <DialogContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="subtitle1">{groupName || "未命名群聊"}</Typography>
          <Typography variant="body2" color="text.secondary">
            共 {members.length} 人
          </Typography>
        </Stack>
        {members.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            暂无成员信息。
          </Typography>
        ) : (
          <List dense>
            {members.map((m) => (
              <ListItem key={m.userId} disableGutters>
                <ListItemAvatar>
                  <Avatar src={m.avatar ?? undefined} sx={{ width: 32, height: 32 }}>
                    {m.firstName?.[0]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="body2">
                      {m.firstName}
                      {m.lastName}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {m.phone}
                      {m.email ? ` · ${m.email}` : ""}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>关闭</Button>
      </DialogActions>
    </Dialog>
  );
};
