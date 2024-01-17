import React from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  TextField,
  Unstable_Grid2 as Grid,
} from "@mui/material";
import { StoreType } from "src/types/store.type";

export function CompanyProfileDetails({ company }: { company: StoreType }) {
  return (
    <Card>
      <CardHeader subheader="地址信息仅预览" title="商铺地址" />
      <CardContent sx={{ pt: 0 }}>
        <Box sx={{ m: -1.5 }}>
          <Grid container spacing={3}>
            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                label="省/直辖市"
                name="province"
                disabled
                required
                value={company.province_name}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                label="市"
                name="city"
                required
                disabled
                value={company.city_name}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                label="区"
                name="area"
                type="text"
                disabled
                value={company.area_name}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                label="城镇地区"
                name="town"
                required
                disabled
                value={company.town_name}
              />
            </Grid>
            <Grid xs={12} md={12}>
              <TextField
                fullWidth
                label="店铺详细地址"
                name="address"
                required
                disabled
                value={company.address}
              />
            </Grid>
          </Grid>
        </Box>
      </CardContent>
      <Divider />
    </Card>
  );
}
