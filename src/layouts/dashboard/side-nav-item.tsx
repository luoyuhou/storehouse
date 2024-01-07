import React from "react";
import NextLink from "next/link";
import PropTypes from "prop-types";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  ButtonBase,
  SvgIcon,
  Typography,
} from "@mui/material";
import { DashboardItemType } from "src/layouts/dashboard/public-config";
import ChevronDownIcon from "@heroicons/react/24/solid/ChevronDownIcon";

function NavItem({ props }: { props: DashboardItemType & { pathname: string } }) {
  const { disabled, external, icon, path, title } = props;
  const active = props.path ? props.path === props.pathname : false;

  // eslint-disable-next-line no-nested-ternary
  const linkProps = path
    ? external
      ? {
          component: "a",
          href: path,
          target: "_blank",
        }
      : {
          component: NextLink,
          href: path,
        }
    : {};

  return (
    <ButtonBase
      sx={{
        alignItems: "center",
        borderRadius: 1,
        display: "flex",
        justifyContent: "flex-start",
        pl: "16px",
        pr: "16px",
        py: "6px",
        textAlign: "left",
        width: "100%",
        ...(active && {
          backgroundColor: "rgba(255, 255, 255, 0.04)",
        }),
        "&:hover": {
          backgroundColor: "rgba(255, 255, 255, 0.04)",
        },
      }}
      {...linkProps}
    >
      {icon && (
        <Box
          component="span"
          sx={{
            alignItems: "center",
            color: "neutral.400",
            display: "inline-flex",
            justifyContent: "center",
            mr: 2,
            ...(active && {
              color: "primary.main",
            }),
          }}
        >
          {icon}
        </Box>
      )}
      <Box
        component="span"
        sx={{
          color: "neutral.400",
          flexGrow: 1,
          fontFamily: (theme) => theme.typography.fontFamily,
          fontSize: 14,
          fontWeight: 600,
          lineHeight: "24px",
          whiteSpace: "nowrap",
          ...(active && {
            color: "common.white",
          }),
          ...(disabled && {
            color: "neutral.500",
          }),
        }}
      >
        {title}
      </Box>
    </ButtonBase>
  );
}

export function SideNavItem(
  props: DashboardItemType & { pathname: string; group?: DashboardItemType[] },
) {
  const { pathname, group, title, icon, disabled } = props;
  const active = props.path ? props.path === pathname : false;

  if (group && group.length) {
    const childrenActive = pathname.indexOf(`${props.path}/`) === 0;
    return (
      <Accordion style={{ backgroundColor: "rgba(0,0,0,0)" }}>
        <AccordionSummary
          expandIcon={
            <SvgIcon fontSize="small">
              <ChevronDownIcon />
            </SvgIcon>
          }
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>
            <ButtonBase
              sx={{
                alignItems: "center",
                borderRadius: 1,
                display: "flex",
                justifyContent: "flex-start",
                textAlign: "left",
                width: "100%",
                ...((active || childrenActive) && {
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                }),
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                },
              }}
            >
              {icon && (
                <Box
                  component="span"
                  sx={{
                    alignItems: "center",
                    color: "neutral.400",
                    display: "inline-flex",
                    justifyContent: "center",
                    mr: 2,
                    ...((active || childrenActive) && {
                      color: "primary.main",
                    }),
                  }}
                >
                  {icon}
                </Box>
              )}
              <Box
                component="span"
                sx={{
                  color: "neutral.400",
                  flexGrow: 1,
                  fontFamily: (theme) => theme.typography.fontFamily,
                  fontSize: 14,
                  fontWeight: 600,
                  lineHeight: "24px",
                  whiteSpace: "nowrap",
                  ...((active || childrenActive) && {
                    color: "common.white",
                  }),
                  ...(disabled && {
                    color: "neutral.500",
                  }),
                }}
              >
                {title}
              </Box>
            </ButtonBase>
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {group.map((i) => (
            <NavItem key={i.title} props={{ ...i, pathname }} />
          ))}
        </AccordionDetails>
      </Accordion>
    );
  }

  return (
    <li>
      <NavItem props={props} />
    </li>
  );
}

SideNavItem.propTypes = {
  pathname: PropTypes.string.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  disabled: PropTypes.bool,
  // eslint-disable-next-line react/no-unused-prop-types
  external: PropTypes.bool,
  icon: PropTypes.node,
  path: PropTypes.string,
  title: PropTypes.string.isRequired,
  group: PropTypes.array,
};
