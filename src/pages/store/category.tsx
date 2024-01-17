import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import React, { useEffect } from "react";
import Head from "next/head";
import {
  Box,
  Container,
  Stack,
  Typography,
  Accordion,
  AccordionSummary,
  FormControlLabel,
  AccordionDetails,
  SvgIcon,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { CategoryAdd } from "src/sections/category/category-add";
// import chevron-double-down
import { ChevronDoubleDownIcon, ChevronDoubleUpIcon } from "@heroicons/react/20/solid";

function SwitchRank({
  onUp,
  upDisabled,
  onDown,
  downDisabled,
}: {
  onUp: () => void;
  upDisabled?: boolean;
  onDown: () => void;
  downDisabled?: boolean;
}) {
  return (
    <Box mr={1}>
      <Button size="small" disabled={upDisabled} onClick={() => onUp()}>
        <SvgIcon fontSize="small">
          <ChevronDoubleUpIcon />
        </SvgIcon>
      </Button>
      <span style={{ padding: "0 5px" }} />
      <Button size="small" disabled={downDisabled} onClick={() => onDown()}>
        <SvgIcon>
          <ChevronDoubleDownIcon />
        </SvgIcon>
      </Button>
    </Box>
  );
}

const data: { label: string; content: string }[] = [
  {
    label: "1 I acknowledge that I should stop the click event propagation",
    content:
      "The click event of the nested action will propagate up and expand the accordion unless you explicitly stop it.",
  },
  {
    label: "2 I acknowledge that I should stop the focus event propagation",
    content:
      "The focus event of the nested action will propagate up and also focus the accordion unless you explicitly stop it.",
  },
  {
    label: "3 I acknowledge that I should provide an aria-label on each action that I add",
    content:
      "If you forget to put an aria-label on the nested action, the label of the action\n" +
      "                    will also be included in the label of the parent button that controls the\n" +
      "                    accordion expansion.",
  },
];

function Category() {
  const [list, setList] = React.useState(data);

  const onUp = (index: number) => {
    console.log("up index", index);
    if (!index) {
      return;
    }

    const temp = list[index - 1];
    list[index - 1] = list[index];
    list[index] = temp;
    setList([...list]);
  };

  const onDown = (index: number) => {
    console.log("down index", index);
    if (index === list.length - 1) {
      return;
    }

    const temp = list[index + 1];
    console.log("temp", temp);
    list[index + 1] = list[index];
    list[index] = temp;
    setList([...list]);
  };

  useEffect(() => {
    console.log("list", list);
  }, [list]);

  return (
    <>
      <Head>
        <title>Category</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 4,
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={3}>
            <div>
              <Typography variant="h4">Category</Typography>
            </div>
            <div className="w-full">
              {list.map(({ label, content }, index) => (
                <Accordion key={label}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-label="Expand"
                    aria-controls={`additional-${label}-content`}
                    id={`additional-${label}-header`}
                  >
                    <FormControlLabel
                      aria-label="Acknowledge"
                      onClick={(event) => event.stopPropagation()}
                      onFocus={(event) => event.stopPropagation()}
                      control={
                        <SwitchRank
                          onUp={() => onUp(index)}
                          onDown={() => onDown(index)}
                          upDisabled={index === 0}
                          downDisabled={index === list.length - 1}
                        />
                      }
                      label={label}
                    />
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography color="textSecondary">{content}</Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </div>
            <CategoryAdd pid="" />
          </Stack>
        </Container>
      </Box>
    </>
  );
}

Category.getLayout = (page: JSX.Element) => <DashboardLayout>{page}</DashboardLayout>;

export default Category;
