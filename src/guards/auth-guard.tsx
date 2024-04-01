import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { useAuthContext } from "src/contexts/auth-context";
import { ResourcesFromAuthType } from "src/types/role-management.type";

export function AuthGuard(props: { children: never }) {
  const { children } = props;
  const router = useRouter();
  const { isAuthenticated, authPaths, user } = useAuthContext();
  const ignore = useRef(false);
  const [checked, setChecked] = useState(false);

  // Only do authentication check on component mount.
  // This flow allows you to manually redirect the user after sign-out, otherwise this will be
  // triggered and will automatically redirect to sign-in page.

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    // Prevent from calling twice in development mode with React.StrictMode enabled
    if (ignore.current) {
      return;
    }

    ignore.current = true;

    if (!isAuthenticated) {
      router
        .replace({
          pathname: "/auth/sign-in",
          query: router.asPath !== "/" ? { continueUrl: router.asPath } : undefined,
        })
        .catch(console.error);
    } else {
      setChecked(true);
    }

    const isAdmin = authPaths.find(({ auth_id }) => auth_id === "*");
    if (isAdmin) {
      return;
    }

    // path check
    // const needCheckPaths = ["/store"];
    const needCheckPaths: string[] = ["/store", "/manage"];
    const { pathname } = router;
    console.log("pathname", pathname);
    const needCheck = needCheckPaths.some((p) => p === pathname || pathname.indexOf(`${p}/`) === 0);
    console.log("neeed", needCheck);
    if (!needCheck) {
      return;
    }

    const pathVerified = ((authPaths ?? []) as ResourcesFromAuthType[]).some(({ path, side }) => {
      if (side !== 1) {
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
    if (!pathVerified) {
      router.replace(`/403?prePath=${pathname}`);
    }
  }, [router.isReady]);

  if (!checked) {
    return null;
  }

  // If got here, it means that the redirect did not occur, and that tells us that the user is
  // authenticated / authorized.

  return children;
}

AuthGuard.propTypes = {
  children: PropTypes.node,
};
