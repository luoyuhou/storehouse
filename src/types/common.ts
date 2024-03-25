/* eslint-disable @typescript-eslint/no-explicit-any */
export type OptionType = { label: string; value: string | number };

export type PaginationResponseType = {
  pages: number;
  rows: number;
  data: Record<string, any>[];
};
