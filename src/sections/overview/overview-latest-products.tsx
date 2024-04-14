import React, { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import PropTypes from "prop-types";
import ArrowRightIcon from "@heroicons/react/24/solid/ArrowRightIcon";
import EllipsisVerticalIcon from "@heroicons/react/24/solid/EllipsisVerticalIcon";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardHeader,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  SvgIcon,
  Typography,
} from "@mui/material";
import { useAuthContext } from "src/contexts/auth-context";
import { post } from "src/lib/http";
import { UserLoginHistory, UserSessionType } from "src/types/users";
import { getInitials } from "src/utils/get-initials";
import { LOGIN_SOURCE_TYPE_OPTIONS } from "src/constant/role-management.const";
import ArrowLeftIcon from "@heroicons/react/24/solid/ArrowLeftIcon";

export function OverviewLatestProducts(props: { sx: { height: string } }) {
  const { user } = useAuthContext();
  const { sx } = props;
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(0);
  const [data, setData] = useState<UserLoginHistory[]>([]);

  useEffect(() => {
    post<{
      data: UserLoginHistory[];
      pages: number;
    }>({
      url: "/api/users/users-login/pagination",
      payload: {
        pageNum: page,
        pageSize: 5,
        filtered: [{ id: "user_id", value: (user as unknown as UserSessionType)?.id }],
        sorted: [],
      },
    }).then(({ data: list, pages: innerPages }) => {
      setData(list);
      setPages(innerPages);
    });
  }, [page]);

  return (
    <Card sx={sx}>
      <CardHeader title="登录记录" />
      <List>
        {data.map((product, index) => {
          const hasDivider = index < data.length - 1;
          const ago = formatDistanceToNow(new Date(product.create_date));

          return (
            <ListItem divider={hasDivider} key={product.id}>
              <ListItemAvatar>
                <Avatar src="">
                  {getInitials(
                    LOGIN_SOURCE_TYPE_OPTIONS.find(({ value }) => value === product.source)
                      ?.label ?? "",
                  )}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={product.ip}
                primaryTypographyProps={{ variant: "subtitle1" }}
                secondary={`Updated ${ago} ago`}
                secondaryTypographyProps={{ variant: "body2" }}
              />
              <IconButton edge="end">
                <SvgIcon>
                  <EllipsisVerticalIcon />
                </SvgIcon>
              </IconButton>
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <CardActions className="flex justify-between">
        <Button
          color="inherit"
          startIcon={
            <SvgIcon fontSize="small">
              <ArrowLeftIcon />
            </SvgIcon>
          }
          size="small"
          variant="text"
          disabled={page <= 0}
          onClick={() => setPage((c) => (c - 1 < 0 ? 0 : c - 1))}
        >
          上一页
        </Button>

        <Typography variant="subtitle2">
          第 {page + 1} / {pages} 页
        </Typography>
        <Button
          color="inherit"
          endIcon={
            <SvgIcon fontSize="small">
              <ArrowRightIcon />
            </SvgIcon>
          }
          size="small"
          variant="text"
          disabled={page >= pages - 1}
          onClick={() => setPage((c) => (page + 1 >= pages - 1 ? pages - 1 : c + 1))}
        >
          下一页
        </Button>
      </CardActions>
    </Card>
  );
}

OverviewLatestProducts.propTypes = {
  sx: PropTypes.object,
};
