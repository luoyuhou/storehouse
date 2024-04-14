import { ResourcesFromAuthType } from "src/types/role-management.type";
import { EAuthTypeValues } from "src/constant/role-management.const";

export const authPermission = (authPaths: ResourcesFromAuthType[], pathname: string) => {
  return ((authPaths ?? []) as ResourcesFromAuthType[]).some(({ path, side }) => {
    if (![EAuthTypeValues.ALL, EAuthTypeValues.UI].includes(side)) {
      return false;
    }

    if (path === pathname) {
      return true;
    }

    if (!path.includes("*")) {
      return false;
    }

    const arrByPath = path.split("*");
    const arrByPathname = pathname.split("/");

    return arrByPath[0] === `/${arrByPathname?.[1]}`;
  });
};
