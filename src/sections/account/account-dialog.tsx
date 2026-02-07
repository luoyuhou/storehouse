import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogProps,
  Box,
  Unstable_Grid2 as Grid,
} from "@mui/material";
import { AccountProfile } from "src/sections/account/account-profile";
import { AccountProfileDetails } from "src/sections/account/account-profile-details";

export interface AccountDialogProps extends Pick<DialogProps, "open" | "onClose"> {}

export function AccountDialog({ open, onClose }: AccountDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>账号设置</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid xs={12} md={5} lg={4}>
              <AccountProfile />
            </Grid>
            <Grid xs={12} md={7} lg={8}>
              <AccountProfileDetails />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
