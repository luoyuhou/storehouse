import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { useAuthContext } from "src/contexts/auth-context";
import { authPermission } from "src/utils/auth";

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
  }, [router.isReady]);

  useEffect(() => {
    const isAdmin = authPaths.find(({ auth_id }) => auth_id === "*");
    if (isAdmin) {
      return;
    }

    const notCheckPaths = [
      "/",
      "/403*",
      "/404*",
      "/auth*",
      "/account*",
      "/settings*",
      "/tools*",
      "/apply*",
      "/comment-feature*",
    ];
    const { pathname } = router;
    const isNotNeedCheck = notCheckPaths.some((p) => {
      if (p === pathname) {
        return true;
      }

      if (!p.includes("*")) {
        return false;
      }

      const arrByPath = p.split("*");
      const arrByPathname = pathname.split("/");

      return arrByPath[0] === `/${arrByPathname?.[1]}`;
    });
    console.log("isNotNeedCheck", isNotNeedCheck);
    if (isNotNeedCheck) {
      return;
    }

    const pathVerified = authPermission(authPaths, pathname);
    if (!pathVerified) {
      router.replace(`/403?prePath=${pathname}`);
    }
  }, [router.pathname]);

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
