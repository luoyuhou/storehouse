import React from "react";
import { Layout as AuthLayout } from "@/layouts/auth/layout";
import Page from "@/pages/auth/sign-in";

function ForgetPassword() {
  return <div>Forget password -- page</div>;
}

Page.getLayout = (page: React.ReactNode) => <AuthLayout>{page}</AuthLayout>;
export default ForgetPassword;
