import { useEffect } from "react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { get } from "@/lib/http";

const LoggedIn = (router: AppRouterInstance) => {
  useEffect(() => {
    get("/api/auth/sign-in").then(() => {
      router.push("/");
    });
  }, []);
};

export default LoggedIn;
