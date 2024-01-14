import React from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  Typography,
} from "@mui/material";
import { StoreType } from "src/types/store.type";
import { CompanyStatus } from "src/sections/companies/company-status";

export function CompanyProfile({ company }: { company: StoreType }) {
  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Avatar
            src={company.logo}
            sx={{
              height: 80,
              mb: 2,
              width: 80,
            }}
          >
            {company.store_name.slice(0, 2)}
          </Avatar>
          <Typography gutterBottom variant="h5">
            {company.store_name}
          </Typography>
          <CompanyStatus status={company.status} />
          <Typography color="text.secondary" variant="body2">
            商家: {company.id_name}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            身份证号码: {company.id_code}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            电话: {company.phone}
          </Typography>
        </Box>
      </CardContent>
      <Divider />
      <CardActions>
        <Button fullWidth variant="text">
          更换商铺 Logo
        </Button>
      </CardActions>
    </Card>
  );
}
