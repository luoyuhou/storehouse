import React from "react";
import { SvgIcon } from "@mui/material";
import {
  ListBulletIcon,
  ShoppingBagIcon,
  HomeIcon,
  Bars2Icon,
  DocumentTextIcon,
  ShoppingCartIcon,
  UsersIcon,
  ServerStackIcon,
  BuildingStorefrontIcon,
  LockClosedIcon,
  PhotoIcon,
  CreditCardIcon,
  FolderIcon,
  ArrowUturnLeftIcon,
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
        title: "商品管理",
        path: "/store/goods",
        icon: (
          <SvgIcon fontSize="small">
            <ListBulletIcon />
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
      {
        title: "订单日报",
        path: "/store/order-daily-report",
        icon: (
          <SvgIcon fontSize="small">
            <DocumentTextIcon />
          </SvgIcon>
        ),
      },
      {
        title: "商家结算",
        path: "/store/settlement",
        icon: (
          <SvgIcon fontSize="small">
            <DocumentTextIcon />
          </SvgIcon>
        ),
      },
      {
        title: "服务管理",
        path: "/store/services",
        icon: (
          <SvgIcon fontSize="small">
            <CreditCardIcon />
          </SvgIcon>
        ),
      },
      {
        title: "退款管理",
        path: "/store/refund",
        icon: (
          <SvgIcon fontSize="small">
            <ArrowUturnLeftIcon />
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
        title: "商铺服务管理",
        path: "/manage/companies",
        icon: (
          <SvgIcon fontSize="small">
            <BuildingStorefrontIcon />
          </SvgIcon>
        ),
      },
      {
        title: "平台结算",
        path: "/manage/settlement",
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
        title: "服务套餐",
        path: "/manage/plans",
        icon: (
          <SvgIcon fontSize="small">
            <ServerStackIcon />
          </SvgIcon>
        ),
      },
      {
        title: "订单趋势（按月）",
        path: "/manage/order-monthly-trend",
        icon: (
          <SvgIcon fontSize="small">
            <DocumentTextIcon />
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
        title: "文件资源",
        path: "/manage/files",
        icon: (
          <SvgIcon fontSize="small">
            <FolderIcon />
          </SvgIcon>
        ),
      },
    ],
  },
];
