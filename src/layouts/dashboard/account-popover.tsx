import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import PropTypes from "prop-types";
import { Box, Divider, MenuItem, MenuList, Popover, Typography } from "@mui/material";
import { PopoverProps } from "@mui/material/Popover/Popover";
import { useAuth } from "src/hooks/use-auth";
import { UserSessionType } from "src/types/users";

export function AccountPopover(props: PopoverProps & { onClose?: () => void }) {
  const { anchorEl, onClose, open } = props;
  const router = useRouter();
  const auth = useAuth();

  const handleSignOut = useCallback(() => {
    onClose?.();
    auth.signOut();
    router.push("/auth/sign-in");
  }, [onClose, auth, router]);

  const { user } = auth;

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{
        horizontal: "left",
        vertical: "bottom",
      }}
      onClose={onClose}
      open={open}
      PaperProps={{ sx: { width: 200 } }}
    >
      <Box
        sx={{
          py: 1.5,
          px: 2,
        }}
      >
        <Typography variant="overline">
          <a href="/account">Account</a>
        </Typography>
        <Divider />
        <Typography sx={{ py: 1 }} color="secondary" variant="body2">
          {`${(user as unknown as UserSessionType)?.first_name} ${(user as unknown as UserSessionType)?.last_name}`}
        </Typography>
        <Divider />
        <Typography sx={{ py: 1 }}>{(user as unknown as UserSessionType)?.phone}</Typography>
      </Box>
      <Divider />
      <MenuList
        disablePadding
        dense
        sx={{
          p: "8px",
          "& > *": {
            borderRadius: 1,
          },
        }}
      >
        <MenuItem onClick={handleSignOut}>Sign out</MenuItem>
      </MenuList>
    </Popover>
  );
}

AccountPopover.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  anchorEl: PropTypes.any,
  onClose: PropTypes.func,
  open: PropTypes.bool.isRequired,
};
