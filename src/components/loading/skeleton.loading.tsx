import React from "react";
import { Skeleton } from "@mui/material";
import { SkeletonOwnProps } from "@mui/material/Skeleton/Skeleton";

export default function SkeletonLoading({
  loading,
  children,
  ...props
}: SkeletonOwnProps & {
  loading: boolean;
}) {
  if (loading) return <Skeleton variant={props.variant} width={props.width} />;

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
}
