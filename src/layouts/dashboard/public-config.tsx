import React from "react";
// import LockClosedIcon from "@heroicons/react/24/solid/LockClosedIcon";
// import UserPlusIcon from "@heroicons/react/24/solid/UserPlusIcon";
import { SvgIcon } from "@mui/material";
import {
  ChartBarIcon,
  CogIcon,
  WrenchScrewdriverIcon,
  PuzzlePieceIcon,
} from "@heroicons/react/24/solid";

export type DashboardItemType = {
  title: string;
  path: string;
  icon: JSX.Element;
  disabled?: boolean;
  external?: boolean;
};

export const items: (DashboardItemType & { group?: DashboardItemType[] })[] = [
  {
    title: "首页",
    path: "/",
    icon: (
      <SvgIcon fontSize="small">
        <ChartBarIcon />
      </SvgIcon>
    ),
  },
  {
    title: "设置",
    path: "/settings",
    icon: (
      <SvgIcon fontSize="small">
        <CogIcon />
      </SvgIcon>
    ),
  },
  {
    title: "工具箱",
    path: "/tools",
    icon: (
      <SvgIcon fontSize="small">
        {/* <XCircleIcon /> */}
        <WrenchScrewdriverIcon />
      </SvgIcon>
    ),
  },
  {
    title: "服务订阅",
    path: "/apply",
    icon: (
      <SvgIcon fontSize="small">
        {/* <XCircleIcon /> */}
        {/* <WrenchScrewdriverIcon /> */}
        <PuzzlePieceIcon />
      </SvgIcon>
    ),
  },
];
