export const FEEDBACK_CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "support", label: "联系管理员 / 留言" },
  { value: "feature", label: "功能建议" },
  { value: "bug", label: "问题 / Bug" },
  { value: "ui", label: "界面与体验" },
  { value: "performance", label: "性能优化" },
  { value: "other", label: "其他" },
];

/** 与 open-api auth AppType 对齐 */
export const FEEDBACK_APP_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "user", label: "主站" },
  { value: "cashier", label: "经营吧" },
  { value: "publisher", label: "一键发文" },
];

export function feedbackAppTypeLabel(appType?: string | null): string {
  if (!appType) return "未分类";
  return FEEDBACK_APP_TYPE_OPTIONS.find((o) => o.value === appType)?.label || appType;
}
