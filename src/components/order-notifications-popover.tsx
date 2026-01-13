import React from "react";
import { Box, Popover, Typography, List, ListItem, Divider, Chip, Stack } from "@mui/material";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

interface NewOrderNotification {
  order_id: string;
  store_name: string;
  recipient: string;
  money: number;
  goods_count: number;
  total_items: number;
  create_time: string;
}

interface OrderNotificationsPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  notifications: NewOrderNotification[];
  onClearAll: () => void;
}

export function OrderNotificationsPopover({
  anchorEl,
  open,
  onClose,
  notifications,
  onClearAll,
}: OrderNotificationsPopoverProps) {
  const handleClearAll = () => {
    onClearAll();
    onClose();
  };

  return (
    <Popover
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      PaperProps={{
        sx: {
          width: 400,
          maxHeight: 600,
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h6">订单通知</Typography>
          {notifications.length > 0 && (
            <Typography
              variant="body2"
              color="primary"
              sx={{ cursor: "pointer" }}
              onClick={handleClearAll}
            >
              清空全部
            </Typography>
          )}
        </Stack>
        <Typography variant="body2" color="text.secondary">
          您有 {notifications.length} 条新订单通知
        </Typography>
      </Box>
      <Divider />
      {notifications.length === 0 ? (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            暂无新订单通知
          </Typography>
        </Box>
      ) : (
        <List sx={{ maxHeight: 480, overflow: "auto" }}>
          {notifications.map((notification, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <React.Fragment key={`${notification.order_id}-${index}`}>
              <ListItem
                sx={{
                  flexDirection: "column",
                  alignItems: "flex-start",
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <Stack spacing={1} width="100%">
                  <Stack direction="row" justifyContent="space-between" width="100%">
                    <Typography variant="subtitle2" fontWeight="bold">
                      新订单 #{notification.order_id}
                    </Typography>
                    <Chip label="新" color="success" size="small" />
                  </Stack>

                  <Stack spacing={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>店铺:</strong> {notification.store_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>收货人:</strong> {notification.recipient}
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>商品数量:</strong> {notification.goods_count}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>总件数:</strong> {notification.total_items}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="error" fontWeight="bold">
                      订单金额: ¥{(notification.money / 100).toFixed(2)}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {formatDistanceToNow(new Date(notification.create_time), {
                        addSuffix: true,
                        locale: zhCN,
                      })}
                    </Typography>
                  </Stack>
                </Stack>
              </ListItem>
              {index < notifications.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Popover>
  );
}
