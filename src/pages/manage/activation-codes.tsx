import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";

/** @deprecated 已合并到 /manage/quota-orders */
function ActivationCodesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/manage/quota-orders");
  }, [router]);

  return null;
}

ActivationCodesRedirectPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default ActivationCodesRedirectPage;
