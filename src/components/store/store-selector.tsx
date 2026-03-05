import React, { useEffect, useMemo, useState } from "react";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { get } from "src/lib/http";
import { StoreType } from "src/types/store.type";

interface StoreSelectorProps {
  label?: string;
  onChange?: (storeId?: string) => void;
}

export function StoreSelector(props: StoreSelectorProps) {
  const { label = "选择店铺（按名称搜索）", onChange } = props;
  const [options, setOptions] = useState<StoreType[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedStore, setSelectedStore] = useState<StoreType | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!inputValue || inputValue.trim().length === 0) {
      setOptions([]);
      return;
    }

    let active = true;
    setLoading(true);
    const timer = setTimeout(() => {
      get<StoreType[]>(`/api/store/search?type=name&value=${encodeURIComponent(inputValue.trim())}`)
        .then((res) => {
          if (!active) return;
          setOptions(res || []);
        })
        .catch(() => {
          if (!active) return;
          setOptions([]);
        })
        .finally(() => {
          if (!active) return;
          setLoading(false);
        });
    }, 300);

    // eslint-disable-next-line consistent-return
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [inputValue]);

  const renderLabel = useMemo(() => {
    return (store: StoreType) => `${store.store_name}（${store.store_id}）`;
  }, []);

  return (
    <Autocomplete
      size="small"
      sx={{ minWidth: 600 }}
      options={options}
      loading={loading}
      getOptionLabel={(option) => renderLabel(option)}
      value={selectedStore}
      onChange={(event, newValue) => {
        setSelectedStore(newValue);
        if (onChange) {
          onChange(newValue?.store_id);
        }
      }}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={16} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}
