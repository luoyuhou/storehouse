import React, { useEffect } from "react";
import { CategoryAccordion } from "src/sections/category/category-accordion";
import { CategoryAdd } from "src/sections/category/category-add";
import { Box, Card, CardContent } from "@mui/material";
import { get } from "src/lib/http";
import { toast } from "react-toastify";
import { CategoryType } from "src/types/category.type";
import LinearBufferLoading from "src/components/loading/linear-buffer.loading";

export type CategoryItem = {
  label: string;
  value: string;
};

export function CategoryManagement({ storeId }: { storeId?: string }) {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [list, setList] = React.useState<CategoryItem[]>([]);
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [trigger, setTrigger] = React.useState(0);

  useEffect(() => {
    if (!storeId) {
      return;
    }

    setLoading(true);
    get<CategoryType[]>(`/api/store/category/${storeId}`)
      .then((res) => {
        setList(res.map(({ category_id, name }) => ({ label: name, value: category_id })));
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [storeId, trigger]);

  if (!storeId) {
    return null;
  }

  return (
    <Card sx={{ minHeight: "500px" }}>
      <CardContent>
        <Box
          sx={{
            alignItems: "left",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <LinearBufferLoading loading={loading}>
            {list.map(({ label, value }, index) => (
              <CategoryAccordion
                key={`category-${value}`}
                storeId={storeId}
                upDisabled={index === 0 || submitting}
                downDisabled={index === list.length - 1 || submitting}
                label={label}
                value={value}
                setSubmitting={setSubmitting}
                setTrigger={setTrigger}
              />
            ))}
            <hr />
            <CategoryAdd storeId={storeId} setTrigger={setTrigger} />
          </LinearBufferLoading>
        </Box>
      </CardContent>
    </Card>
  );
}
