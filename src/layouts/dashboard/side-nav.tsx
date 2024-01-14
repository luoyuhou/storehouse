import React from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import PropTypes from "prop-types";
import ArrowTopRightOnSquareIcon from "@heroicons/react/24/solid/ArrowTopRightOnSquareIcon";
import ChevronUpDownIcon from "@heroicons/react/24/solid/ChevronUpDownIcon";
import {
  Box,
  Button,
  Divider,
  Drawer,
  Stack,
  SvgIcon,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Logo } from "src/components/logo";
import { Scrollbar } from "src/components/scrollbar";
import { Theme } from "@mui/material/styles/createTheme";
import { privateItems } from "src/layouts/dashboard/private-config";
import { items } from "./public-config";
import { SideNavItem } from "./side-nav-item";

export function SideNav(props: { open: boolean; onClose: () => void }) {
  const { open, onClose } = props;
  const pathname = usePathname();
  const lgUp = useMediaQuery<Theme>((theme) => theme.breakpoints.up("lg"));

  const content = (
    <Scrollbar
      sx={{
        height: "100%",
        "& .simplebar-content": {
          height: "100%",
        },
        "& .simplebar-scrollbar:before": {
          background: "neutral.400",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box
            component={NextLink}
            href="/"
            sx={{
              display: "inline-flex",
              height: 32,
              width: 32,
            }}
          >
            <Logo />
          </Box>
          <Box
            sx={{
              alignItems: "center",
              backgroundColor: "rgba(255, 255, 255, 0.04)",
              borderRadius: 1,
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              mt: 2,
              p: "12px",
            }}
          >
            <div>
              <Typography color="inherit" variant="subtitle1">
                Devias
              </Typography>
              <Typography color="neutral.400" variant="body2">
                Production
              </Typography>
            </div>
            <SvgIcon fontSize="small" sx={{ color: "neutral.500" }}>
              <ChevronUpDownIcon />
            </SvgIcon>
          </Box>
        </Box>
        <Divider sx={{ borderColor: "neutral.700" }} />
        <Box
          component="nav"
          sx={{
            flexGrow: 1,
            px: 2,
            py: 3,
          }}
        >
          <Stack
            component="ul"
            spacing={0.5}
            sx={{
              listStyle: "none",
              p: 0,
              m: 0,
            }}
          >
            {items.map((item) => {
              return (
                <SideNavItem
                  pathname={pathname}
                  disabled={item.disabled}
                  external={item.external}
                  icon={item.icon}
                  key={item.title}
                  path={item.path}
                  title={item.title}
                  group={item.group}
                />
              );
            })}
          </Stack>
        </Box>
        <Button
          component="a"
          endIcon={
            <SvgIcon fontSize="small">
              <ArrowTopRightOnSquareIcon />
            </SvgIcon>
          }
          fullWidth
          href="/comment-feature"
          sx={{ mt: 2 }}
          target="_blank"
          variant="contained"
        >
          期待功能 | 宝贵建议
        </Button>
        <Divider sx={{ borderColor: "neutral.700", marginTop: "10px" }} />
        <Box
          className="simple-scrollbar"
          sx={{
            px: 2,
            py: 3,
            overflow: "auto",
          }}
        >
          <Typography color="neutral.100" variant="subtitle2">
            更多功能
          </Typography>
          <Typography color="neutral.500" variant="body2" fontSize={12}>
            如需更多功能, 请订阅您需要的服务.
          </Typography>
          <Box component="nav">
            <Stack
              component="ul"
              spacing={0.5}
              sx={{
                listStyle: "none",
                p: 0,
                m: 0,
              }}
            >
              {privateItems.map((item) => {
                return (
                  <SideNavItem
                    pathname={pathname}
                    disabled={item.disabled}
                    external={item.external}
                    icon={item.icon}
                    key={item.title}
                    path={item.path}
                    title={item.title}
                    group={item.group}
                  />
                );
              })}
            </Stack>
          </Box>
        </Box>
      </Box>
    </Scrollbar>
  );

  if (lgUp) {
    return (
      <Drawer
        anchor="left"
        open
        PaperProps={{
          sx: {
            backgroundColor: "neutral.800",
            color: "common.white",
            width: 280,
          },
        }}
        variant="permanent"
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Drawer
      anchor="left"
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          backgroundColor: "neutral.800",
          color: "common.white",
          width: 280,
        },
      }}
      sx={{ zIndex: (theme) => theme.zIndex.appBar + 100 }}
      variant="temporary"
    >
      {content}
    </Drawer>
  );
}

SideNav.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
};
