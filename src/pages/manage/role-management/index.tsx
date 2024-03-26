import React from "react";
import Head from "next/head";
import { Box, Container, Stack } from "@mui/material";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { CustomerTabs } from "src/components/tabs/customer-tabs";
import { AuthForRoleManagement } from "src/sections/role-management/auth-for-role-management";
import { AuthRoleForRoleManagement } from "src/sections/role-management/authRole-for-role-management";
import { RoleForRoleManagement } from "src/sections/role-management/role-for-role-management";
import { UserRoleForRoleManagement } from "src/sections/role-management/userRole-for-role-management";

function Page() {
  return (
    <>
      <Head>
        <title>Mange | Role-Management</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container style={{ maxWidth: "1400px" }}>
          <Stack>
            <CustomerTabs
              tabs={[
                {
                  key: 0,
                  label: "用户角色",
                  isDefault: true,
                  children: <UserRoleForRoleManagement />,
                },
                { key: 1, label: "Roles", children: <RoleForRoleManagement /> },
                { key: 2, label: "Auth Resource ", children: <AuthRoleForRoleManagement /> },
                {
                  key: 3,
                  label: "Resources",
                  children: <AuthForRoleManagement />,
                },
              ]}
            />
          </Stack>
        </Container>
      </Box>
    </>
  );
}

Page.getLayout = (page: JSX.Element) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
