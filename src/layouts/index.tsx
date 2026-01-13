import React from "react";
import { Inter } from "next/font/google";
// import "./globals.css";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Container from "@mui/material/Container";

const inter = Inter({ subsets: ["latin"] });

function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary" align="center" mt="14px">
      {"Copyright © "}
      <Link color="inherit" href="/">
        luoyuhou.com
      </Link>{" "}
      {new Date().getFullYear()} | {}
      <Link href="https://beian.miit.gov.cn/" color="inherit">
        粤ICP备18154713号
      </Link>
    </Typography>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Container className={inter.className} style={{ maxWidth: "1650px" }}>
      {children}
      <Copyright />
    </Container>
  );
}
