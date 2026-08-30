import React, { useEffect, useRef, useState } from "react";
import MagnifyingGlassIcon from "@heroicons/react/24/solid/MagnifyingGlassIcon";
import { Card, InputAdornment, OutlinedInput, SvgIcon } from "@mui/material";

export function CustomersSearch({
  onChange,
  debounceMs = 300,
}: {
  onChange: (v: string) => void;
  debounceMs?: number;
}) {
  const [value, setValue] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleChange = (raw: string) => {
    setValue(raw);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onChange(raw.trim());
    }, debounceMs);
  };

  return (
    <Card sx={{ p: 2 }}>
      <OutlinedInput
        value={value}
        fullWidth
        placeholder="搜索手机号"
        startAdornment={
          <InputAdornment position="start">
            <SvgIcon color="action" fontSize="small">
              <MagnifyingGlassIcon />
            </SvgIcon>
          </InputAdornment>
        }
        sx={{ maxWidth: 500, minWidth: 500 }}
        onChange={(e) => handleChange(e.target.value)}
        inputProps={{ inputMode: "tel", maxLength: 20 }}
      />
    </Card>
  );
}
