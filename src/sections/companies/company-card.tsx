import React from "react";
import PropTypes from "prop-types";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Divider,
  Link,
  Stack,
  SvgIcon,
  Typography,
} from "@mui/material";
import { StoreType } from "src/types/store.type";
import { ShieldCheckIcon, ViewfinderCircleIcon } from "@heroicons/react/20/solid";
import { CompanyStatus } from "src/sections/companies/company-status";

export function CompanyCard(props: { company: StoreType }) {
  const { company } = props;

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            pb: 3,
          }}
        >
          <Avatar src={company.logo} variant="square" />
        </Box>
        <Typography align="center" gutterBottom variant="h5" color="blue">
          {company.store_name}
        </Typography>
        <Typography align="center" fontSize="14px" gutterBottom>
          {company.province_name ?? company.province} | {company.city_name ?? company.city} |{" "}
          {company.area_name ?? company.area} | {company.town_name ?? company.town}
        </Typography>
        <Typography align="center" variant="body1" fontSize="12px" color="gray">
          {company.address}
        </Typography>
      </CardContent>
      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      <Stack
        alignItems="center"
        direction="row"
        justifyContent="space-between"
        spacing={2}
        sx={{ p: 2 }}
      >
        <Stack alignItems="center" direction="row" spacing={1}>
          <SvgIcon color="secondary" fontSize="small">
            <ShieldCheckIcon />
          </SvgIcon>
          <CompanyStatus status={company.status} />
        </Stack>
        <Stack alignItems="center" direction="row" spacing={1}>
          <SvgIcon color="primary" fontSize="small">
            <ViewfinderCircleIcon />
          </SvgIcon>
          <Link href={`/manage/companies/${company.store_id}`} target="_blank">
            查看
          </Link>
        </Stack>
      </Stack>
    </Card>
  );
}

CompanyCard.propTypes = {
  company: PropTypes.object.isRequired,
};
