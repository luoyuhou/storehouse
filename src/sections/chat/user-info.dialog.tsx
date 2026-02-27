import React from "react";
import { Avatar, Dialog, DialogContent, DialogTitle, Stack, Typography } from "@mui/material";
import { UserEntity } from "src/types/users";

export interface UserInfoDialogProps {
  open: boolean;
  onClose: () => void;
  user?: UserEntity | null;
}

// eslint-disable-next-line react/function-component-definition
export const UserInfoDialog: React.FC<UserInfoDialogProps> = ({ open, onClose, user }) => {
  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>用户信息</DialogTitle>
      <DialogContent>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Avatar src={user.avatar ?? undefined} sx={{ width: 56, height: 56 }}>
            {user.first_name?.[0]}
          </Avatar>
          <Stack spacing={0.5}>
            <Typography variant="subtitle1">
              {user.first_name}
              {user.last_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.phone}
            </Typography>
          </Stack>
        </Stack>
        {user.email && (
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            邮箱：{user.email}
          </Typography>
        )}
        {user.bio && (
          <Typography variant="body2" color="text.secondary">
            简介：{user.bio}
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};
