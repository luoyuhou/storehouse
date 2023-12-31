import { common } from "@mui/material/colors";
import { alpha } from "@mui/material/styles";
import { error, indigo, info, neutral, success, warning } from "./colors";

export type ThemePaletteType = {
  action: {
    active: string;
    disabled: string;
    disabledBackground: string;
    focus: string;
    hover: string;
    selected: string;
  };
  background: {
    default: string;
    paper: string;
  };
  divider: "#F2F4F7";
  error: Record<string, string>;
  info: Record<string, string>;
  mode: "light";
  neutral: Record<string, string>;
  primary: Record<string, string>;
  success: Record<string, string>;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
  warning: Record<string, string>;
};

export function createPalette(): ThemePaletteType {
  return {
    action: {
      active: neutral[500],
      disabled: alpha(neutral[900], 0.38),
      disabledBackground: alpha(neutral[900], 0.12),
      focus: alpha(neutral[900], 0.16),
      hover: alpha(neutral[900], 0.04),
      selected: alpha(neutral[900], 0.12),
    },
    background: {
      default: common.white,
      paper: common.white,
    },
    divider: "#F2F4F7",
    error,
    info,
    mode: "light",
    neutral,
    primary: indigo,
    success,
    text: {
      primary: neutral[900],
      secondary: neutral[500],
      disabled: alpha(neutral[900], 0.38),
    },
    warning,
  };
}
