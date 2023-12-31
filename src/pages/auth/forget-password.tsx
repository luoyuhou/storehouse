import React from "react";
import { Layout as AuthLayout } from "src/layouts/auth/layout";
import Page from "src/pages/auth/sign-in";

function ForgetPassword() {
  return <div>Forget password -- page</div>;
}

Page.getLayout = (page: React.ReactNode) => <AuthLayout>{page}</AuthLayout>;
export default ForgetPassword;
