import React from "react";
import ChartBarIcon from "@heroicons/react/24/solid/ChartBarIcon";
import CogIcon from "@heroicons/react/24/solid/CogIcon";
// import LockClosedIcon from "@heroicons/react/24/solid/LockClosedIcon";
import ShoppingBagIcon from "@heroicons/react/24/solid/ShoppingBagIcon";
import UserIcon from "@heroicons/react/24/solid/UserIcon";
// import UserPlusIcon from "@heroicons/react/24/solid/UserPlusIcon";
import UsersIcon from "@heroicons/react/24/solid/UsersIcon";
import XCircleIcon from "@heroicons/react/24/solid/XCircleIcon";
import { SvgIcon } from "@mui/material";

export type DashboardItemType = {
  title: string;
  path: string;
  icon: JSX.Element;
  disabled?: boolean;
  external?: JSX.Element;
};

export const items: (DashboardItemType & { group?: DashboardItemType[] })[] = [
  {
    title: "Overview",
    path: "/",
    icon: (
      <SvgIcon fontSize="small">
        <ChartBarIcon />
      </SvgIcon>
    ),
  },
  {
    title: "Customers",
    path: "/customers",
    icon: (
      <SvgIcon fontSize="small">
        <UsersIcon />
      </SvgIcon>
    ),
  },
  // {
  //   title: "Companies",
  //   path: "/companies",
  //   icon: (
  //     <SvgIcon fontSize="small">
  //       <ShoppingBagIcon />
  //     </SvgIcon>
  //   ),
  // },
  {
    title: "商店",
    path: "/",
    icon: (
      <SvgIcon fontSize="small">
        <ShoppingBagIcon />
      </SvgIcon>
    ),
    group: [
      {
        title: "我的店铺",
        path: "/store",
        icon: (
          <SvgIcon fontSize="small">
            <UserIcon />
          </SvgIcon>
        ),
      },
      {
        title: "商品分类",
        path: "/store/category",
        icon: (
          <SvgIcon fontSize="small">
            <CogIcon />
          </SvgIcon>
        ),
      },
      {
        title: "商品列表",
        path: "/store/goods-list",
        icon: (
          <SvgIcon fontSize="small">
            <CogIcon />
          </SvgIcon>
        ),
      },
      {
        title: "商品详情",
        path: "/store/goods-detail",
        icon: (
          <SvgIcon fontSize="small">
            <CogIcon />
          </SvgIcon>
        ),
      },
      {
        title: "创建商品",
        path: "/store/create-goods",
        icon: (
          <SvgIcon fontSize="small">
            <CogIcon />
          </SvgIcon>
        ),
      },
      {
        title: "订单",
        path: "/store/order",
        icon: (
          <SvgIcon fontSize="small">
            <CogIcon />
          </SvgIcon>
        ),
      },
    ],
  },
  {
    title: "Account",
    path: "/account",
    icon: (
      <SvgIcon fontSize="small">
        <UserIcon />
      </SvgIcon>
    ),
  },
  {
    title: "Settings",
    path: "/settings",
    icon: (
      <SvgIcon fontSize="small">
        <CogIcon />
      </SvgIcon>
    ),
  },
  {
    title: "Error",
    path: "/404",
    icon: (
      <SvgIcon fontSize="small">
        <XCircleIcon />
      </SvgIcon>
    ),
  },
];
