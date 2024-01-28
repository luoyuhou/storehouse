export type TableHeaderFilterInputProps = {
  type: "input";
  label: string;
  name: string;
};

export type TableHeaderFilterSelectProps = {
  type: "select";
  label: string;
  name: string;
  isMulti: boolean;
  options: { label: string; value: string }[];
};
