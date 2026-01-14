import React from "react";
// import LockClosedIcon from "@heroicons/react/24/solid/LockClosedIcon";
// import UserPlusIcon from "@heroicons/react/24/solid/UserPlusIcon";
import { SvgIcon } from "@mui/material";
import {
  ListBulletIcon,
  ShoppingBagIcon,
  HomeIcon,
  Bars2Icon,
  DocumentTextIcon,
  DocumentPlusIcon,
  ShoppingCartIcon,
  UsersIcon,
  ServerStackIcon,
  BuildingStorefrontIcon,
  LockClosedIcon,
  UserMinusIcon,
  PhotoIcon,
} from "@heroicons/react/24/solid";
import { DashboardItemType } from "src/layouts/dashboard/public-config";

export const privateItems: (DashboardItemType & { group?: DashboardItemType[] })[] = [
  {
    title: "商店",
    path: "/store",
    icon: (
      <SvgIcon fontSize="small">
        <ShoppingBagIcon />
      </SvgIcon>
    ),
    group: [
      {
        title: "我的店铺",
        path: "/store/home",
        icon: (
          <SvgIcon fontSize="small">
            <HomeIcon />
          </SvgIcon>
        ),
      },
      {
        title: "商品分类",
        path: "/store/category",
        icon: (
          <SvgIcon fontSize="small">
            <Bars2Icon />
          </SvgIcon>
        ),
      },
      {
        title: "商品列表",
        path: "/store/goods-list",
        icon: (
          <SvgIcon fontSize="small">
            <ListBulletIcon />
          </SvgIcon>
        ),
      },
      {
        title: "商品详情",
        path: "/store/goods-detail",
        icon: (
          <SvgIcon fontSize="small">
            <DocumentTextIcon />
          </SvgIcon>
        ),
      },
      {
        title: "创建商品",
        path: "/store/create-goods",
        icon: (
          <SvgIcon fontSize="small">
            <DocumentPlusIcon />
          </SvgIcon>
        ),
      },
      {
        title: "订单",
        path: "/store/order",
        icon: (
          <SvgIcon fontSize="small">
            <ShoppingCartIcon />
          </SvgIcon>
        ),
      },
    ],
  },
  {
    title: "管理",
    path: "/manage",
    icon: (
      <SvgIcon fontSize="small">
        <ServerStackIcon />
      </SvgIcon>
    ),
    group: [
      {
        title: "Customers",
        path: "/manage/customers",
        icon: (
          <SvgIcon fontSize="small">
            <UsersIcon />
          </SvgIcon>
        ),
      },
      {
        title: "商户",
        path: "/manage/companies",
        icon: (
          <SvgIcon fontSize="small">
            <BuildingStorefrontIcon />
          </SvgIcon>
        ),
      },
      {
        title: "首页轮播图",
        path: "/manage/home-carousel",
        icon: (
          <SvgIcon fontSize="small">
            <PhotoIcon />
          </SvgIcon>
        ),
      },
      {
        title: "权限系统",
        path: "/manage/role-management",
        icon: (
          <SvgIcon fontSize="small">
            <LockClosedIcon />
          </SvgIcon>
        ),
      },
      {
        title: "踢人下线",
        path: "/manage/kick-offline",
        icon: (
          <SvgIcon fontSize="small">
            <UserMinusIcon />
          </SvgIcon>
        ),
      },
    ],
  },
];
