import React, { useEffect } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  FormControlLabel,
  Grid,
  SvgIcon,
} from "@mui/material";
import { ChevronDoubleDownIcon, ChevronDoubleUpIcon } from "@heroicons/react/20/solid";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { CategoryAdd } from "src/sections/category/category-add";
import { CategoryItem } from "src/sections/category/category-management";
import { get, patch } from "src/lib/http";
import { CategoryType } from "src/types/category.type";
import { toast } from "react-toastify";
import LinearBufferLoading from "src/components/loading/linear-buffer.loading";

type SwitchRankType = {
  label: string;
  value: string;
  upDisabled?: boolean;
  downDisabled?: boolean;
  setSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  setTrigger: React.Dispatch<React.SetStateAction<number>>;
};

function SwitchRank({
  label,
  value,
  setTrigger,
  setSubmitting,
  upDisabled,
  downDisabled,
}: SwitchRankType) {
  return (
    <>
      <Button
        size="small"
        disabled={upDisabled}
        onClick={() => {
          setSubmitting(true);
          patch({ url: `/api/store/category/${value}/rank`, payload: { type: "up" } })
            .then(() => {
              toast.success(`成功修改 ${label} 在列表中的顺序`);
              setTrigger((c) => c + 1);
            })
            .catch((err) => toast.error(JSON.stringify(err.message)))
            .finally(() => setSubmitting(false));
        }}
        style={{ paddingLeft: "0px", paddingRight: "0px" }}
      >
        <SvgIcon fontSize="small">
          <ChevronDoubleUpIcon />
        </SvgIcon>
      </Button>
      <Button
        size="small"
        disabled={downDisabled}
        onClick={() => {
          setSubmitting(true);
          patch({ url: `/api/store/category/${value}/rank`, payload: { type: "down" } })
            .then(() => {
              toast.success(`成功修改 ${label} 在列表中的顺序`);
              setTrigger((c) => c + 1);
            })
            .catch((err) => toast.error(JSON.stringify(err.message)))
            .finally(() => setSubmitting(false));
        }}
        style={{ paddingLeft: "0px", paddingRight: "0px" }}
      >
        <SvgIcon>
          <ChevronDoubleDownIcon />
        </SvgIcon>
      </Button>
    </>
  );
}

export function CategoryAccordion({
  storeId,
  label,
  value,
  ...props
}: SwitchRankType & { storeId: string }) {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [list, setList] = React.useState<CategoryItem[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [trigger, setTrigger] = React.useState<number>(0);
  const [len, setLen] = React.useState<number>(0);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setLoading(true);
    get<CategoryType[]>(`/api/store/category/${storeId}?pid=${value}`)
      .then((res) => {
        setLen(res?.length ?? 0);
        setList(res.map(({ category_id, name }) => ({ label: name, value: category_id })));
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [isOpen, trigger]);

  return (
    <Box>
      <Accordion key={value} style={{ borderTop: "1px solid #eee", marginBottom: "3px" }}>
        <AccordionSummary
          onClick={() => setIsOpen((v) => !v)}
          expandIcon={<ExpandMoreIcon />}
          aria-label="Expand"
          aria-controls={`additional-${value}-content`}
          id={`additional-${value}-header`}
          style={{ marginLeft: "-16px" }}
        >
          <Grid className="w-full" style={{ display: "flex" }}>
            <Grid minWidth="38px" maxWidth="128px" mr={2}>
              <SwitchRank label={label} value={value} {...props} />
            </Grid>
            <Grid>
              <FormControlLabel
                aria-label="Acknowledge"
                onClick={(event) => event.stopPropagation()}
                onFocus={(event) => event.stopPropagation()}
                disableTypography
                label={label}
                control={<span />}
              />
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails>
          <LinearBufferLoading loading={loading}>
            {list.map(({ label: l, value: v }, i) => (
              <CategoryAccordion
                key={`category-children-${v}`}
                storeId={storeId}
                upDisabled={i === 0 || submitting}
                downDisabled={i === len - 1 || submitting}
                label={l}
                value={v}
                setSubmitting={setSubmitting}
                setTrigger={setTrigger}
              />
            ))}
          </LinearBufferLoading>
          <Box mt={1}>
            <CategoryAdd storeId={storeId} pid={value} setTrigger={setTrigger} />
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
