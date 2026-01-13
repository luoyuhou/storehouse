import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import BellIcon from "@heroicons/react/24/solid/BellIcon";
import UsersIcon from "@heroicons/react/24/solid/UsersIcon";
import Bars3Icon from "@heroicons/react/24/solid/Bars3Icon";
import MagnifyingGlassIcon from "@heroicons/react/24/solid/MagnifyingGlassIcon";
import {
  Avatar,
  Badge,
  Box,
  IconButton,
  Stack,
  SvgIcon,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { usePopover } from "src/hooks/use-popover";
import { Theme } from "@mui/material/styles/createTheme";
import ChatDashboard from "src/sections/chat/chat.dashboard";
import { ChatContentItem } from "src/sections/chat/chat.list";
import { useAuth } from "src/hooks/use-auth";
import { UserSessionType } from "src/types/users";
import { useSocket } from "src/contexts/socket";
import { OrderNotificationsPopover } from "src/components/order-notifications-popover";
import { AccountPopover } from "./account-popover";

const SIDE_NAV_WIDTH = 280;
const TOP_NAV_HEIGHT = 64;

// 新订单通知类型定义
interface NewOrderNotification {
  order_id: string;
  store_name: string;
  recipient: string;
  money: number;
  goods_count: number;
  total_items: number;
  create_time: string;
}

export function TopNav(props: { onNavOpen: () => void }) {
  const { onNavOpen } = props;
  const [chatModal, setChatModal] = useState<boolean>(false);
  const lgUp = useMediaQuery<Theme>((theme) => theme.breakpoints.up("lg"));
  const accountPopover = usePopover();
  const notificationsPopover = usePopover();

  const auth = useAuth();
  const { user } = auth as unknown as { user: UserSessionType };

  const [chatList, setChatList] = useState<ChatContentItem[]>([]);
  const [orderNotifications, setOrderNotifications] = useState<NewOrderNotification[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { socket } = useSocket();

  // 初始化音频
  useEffect(() => {
    audioRef.current = new Audio("/audio/order.wav");
    audioRef.current.preload = "auto";
  }, []);

  // 监听聊天消息
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (data: ChatContentItem) => {
      if (chatList.some((i) => i.key === data.key)) {
        return;
      }
      setChatList((prev) => [{ ...data, isRead: chatModal }, ...prev]);
    };

    socket.on("receiveMessage", handleReceiveMessage);

    // eslint-disable-next-line consistent-return
    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [socket, chatList, chatModal]);

  // 监听新订单通知
  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = (data: NewOrderNotification) => {
      // 播放音频
      if (audioRef.current) {
        audioRef.current.play().catch((error) => {
          console.error("播放音频失败:", error);
        });
      }

      // 添加到通知列表（最新的在前面）
      setOrderNotifications((prev) => [data, ...prev]);
    };

    socket.on("newOrder", handleNewOrder);

    // 清理事件监听器
    // eslint-disable-next-line consistent-return
    return () => {
      socket.off("newOrder", handleNewOrder);
    };
  }, [socket]);

  return (
    <>
      <Box
        component="header"
        sx={{
          backdropFilter: "blur(6px)",
          backgroundColor: (theme) => alpha(theme.palette.background.default, 0.8),
          position: "sticky",
          left: {
            lg: `${SIDE_NAV_WIDTH}px`,
          },
          top: 0,
          width: {
            lg: `calc(100% - ${SIDE_NAV_WIDTH}px)`,
          },
          zIndex: (theme) => theme.zIndex.appBar,
        }}
      >
        <Stack
          alignItems="center"
          direction="row"
          justifyContent="space-between"
          spacing={2}
          sx={{
            minHeight: TOP_NAV_HEIGHT,
            px: 2,
          }}
        >
          <Stack alignItems="center" direction="row" spacing={2}>
            {!lgUp && (
              <IconButton onClick={onNavOpen}>
                <SvgIcon fontSize="small">
                  <Bars3Icon />
                </SvgIcon>
              </IconButton>
            )}
            <Tooltip title="Search">
              <IconButton>
                <SvgIcon fontSize="small">
                  <MagnifyingGlassIcon />
                </SvgIcon>
              </IconButton>
            </Tooltip>
          </Stack>
          <Stack alignItems="center" direction="row" spacing={2}>
            <Tooltip title="联系">
              <IconButton
                onClick={() => {
                  const allReadList = chatList.map((item) => ({ ...item, isRead: true }));
                  setChatList(allReadList);
                  setChatModal(true);
                }}
              >
                <Badge
                  badgeContent={chatList.filter((item) => !item.isRead).length}
                  color="success"
                >
                  <SvgIcon fontSize="small">
                    <UsersIcon />
                  </SvgIcon>
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="Notifications">
              <IconButton
                onClick={notificationsPopover.handleOpen}
                ref={notificationsPopover.anchorRef}
              >
                <Badge badgeContent={orderNotifications.length} color="success">
                  <SvgIcon fontSize="small">
                    <BellIcon />
                  </SvgIcon>
                </Badge>
              </IconButton>
            </Tooltip>
            <Avatar
              onClick={accountPopover.handleOpen}
              ref={accountPopover.anchorRef}
              sx={{
                cursor: "pointer",
                height: 40,
                width: 40,
              }}
              src={user.avatar ?? "/assets/avatars/avatar-anika-visser.png"}
            />
          </Stack>
        </Stack>
      </Box>
      <AccountPopover
        anchorEl={accountPopover.anchorRef.current}
        open={accountPopover.open}
        onClose={accountPopover.handleClose}
      />
      <OrderNotificationsPopover
        anchorEl={notificationsPopover.anchorRef.current}
        open={notificationsPopover.open}
        onClose={notificationsPopover.handleClose}
        notifications={orderNotifications}
        onClearAll={() => setOrderNotifications([])}
      />
      <ChatDashboard
        open={chatModal}
        toggle={setChatModal}
        user={user}
        socket={socket}
        chatList={chatList}
      />
    </>
  );
}

TopNav.propTypes = {
  onNavOpen: PropTypes.func,
};
