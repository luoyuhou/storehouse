import React from "react";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Container from "@mui/material/Container";

function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary" align="center" mt="14px">
      {"Copyright © "}
      <Link color="inherit" href="/">
        luoyuhou.cn
      </Link>{" "}
      {new Date().getFullYear()} | {}
      <Link href="https://beian.miit.gov.cn/" color="inherit">
        鄂ICP备2026030385号
      </Link>
    </Typography>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Container style={{ maxWidth: "1650px" }}>
      {children}
      <Copyright />
    </Container>
  );
}
