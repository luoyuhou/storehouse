export const AUTH_PID_OPTIONS = [{ label: "None", value: "0" }];

export enum EAuthTypeValues {
  "ALL" = 0,
  "API" = 1,
  "UI" = 2,
}
export const AUTH_TYPE_OPTIONS = [
  { label: "API", value: EAuthTypeValues.API },
  { label: "UI", value: EAuthTypeValues.UI },
];

export const AUTH_METHOD_OPTIONS = [
  { label: "NONE", value: "0" },
  { label: "GET", value: "GET" },
  { label: "POST", value: "POST" },
  { label: "PATCH", value: "PATCH" },
  { label: "DELETE", value: "DELETE" },
];

export const AUTH_STATUS_OPTIONS = [
  { label: "ACTIVE", value: 1 },
  { label: "INACTIVE", value: 0 },
];

export const USER_ROLE_STATUS_OPTIONS = [
  { label: "ACTIVE", value: 1 },
  { label: "INACTIVE", value: 0 },
];

export const ROLE_AUTH_STATUS_OPTIONS = [
  { label: "ACTIVE", value: 1 },
  { label: "INACTIVE", value: 0 },
];
