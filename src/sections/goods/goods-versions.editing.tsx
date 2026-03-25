import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { GridColDef, GridRowId } from "@mui/x-data-grid";
import { get, post } from "src/lib/http";
import { GoodsVersionType, InitialGoodsVersion } from "src/types/goods.type";
import { toast } from "react-toastify";
import { GOODS_UNIT_NAMES, GOODS_VERSION_STATUS_MAP } from "src/constant/goods.const";
import { EditableTable } from "src/components/table/editable.table";
import { PaginationResponseType } from "src/types/common";
import { ImageEditCell } from "src/components/table/image-edit-cell";
import { ImageViewCell } from "src/components/table/image-view-cell";

// 图片变更状态类型
type ImageChangeState = { type: "new"; file: File; previewUrl: string } | { type: "delete" };

export function GoodsVersionsEditing({ id: goodsId }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState<PaginationResponseType>({
    pages: 0,
    rows: 0,
    data: [],
  });
  // 存储图片变更状态：新上传或删除
  const [imageChanges, setImageChanges] = useState<Record<string | number, ImageChangeState>>({});

  const pageSize = 10;

  useEffect(() => {
    const trimmed = (goodsId ?? "").trim();
    if (!trimmed) {
      return;
    }
    setLoading(true);
    get<{ data: GoodsVersionType[] }>(`/api/store/goods/version/${trimmed}`)
      .then(({ data }) => {
        setPagination({ rows: data.length, pages: Math.ceil(data.length / pageSize), data });
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [goodsId]);

  // 获取待上传的文件
  const getPendingFile = (id: GridRowId): File | null => {
    const change = imageChanges[id];
    if (change?.type === "new") {
      return change.file;
    }
    return null;
  };

  // 检查是否要删除图片
  const shouldDeleteImage = (id: GridRowId): boolean => {
    const change = imageChanges[id];
    return change?.type === "delete";
  };

  const handleImageChange = (id: GridRowId, file: File | null, previewUrl: string | null) => {
    setImageChanges((prev) => {
      if (file && previewUrl) {
        // 新上传图片
        return { ...prev, [id]: { type: "new" as const, file, previewUrl } };
      }
      if (file === null && previewUrl === null) {
        // 删除图片
        return { ...prev, [id]: { type: "delete" as const } };
      }
      // 清除变更（恢复原状）
      // eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/no-unused-vars
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  };

  // 重置图片变更状态（取消编辑时使用）
  const handleImageReset = (id: GridRowId) => {
    setImageChanges((prev) => {
      // eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/no-unused-vars
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleSaveClick = async (payload: GoodsVersionType, file?: File | null) => {
    setSubmitting(true);
    try {
      const formData = new FormData();

      // 添加所有字段到 FormData
      Object.entries(payload).forEach(([key, value]) => {
        // 跳过 image_url，后面单独处理
        if (key === "image_url") return;

        if (value !== undefined && value !== null && value !== "") {
          // 特殊处理 price 字段
          if (key === "price") {
            formData.append(key, String(Number(value) * 100));
          } else if (key === "count") {
            formData.append(key, String(Number(value)));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      // 处理图片
      const rowId = payload.id || payload.version_id;
      const pendingFile = file || getPendingFile(rowId);

      if (pendingFile) {
        // 有新图片要上传
        formData.append("file", pendingFile);
      } else if (shouldDeleteImage(rowId)) {
        // 标记删除图片
        formData.append("image_url", "");
        formData.append("remove_image", "true");
      }

      await post({
        url: `/api/store/goods/version/${goodsId}`,
        payload: formData,
        config: { isFile: true },
      });

      // 重新加载数据
      setLoading(true);
      const { data } = await get<{ data: GoodsVersionType[] }>(
        `/api/store/goods/version/${goodsId}`,
      );
      setPagination({ rows: data.length, pages: Math.ceil(data.length / pageSize), data });

      toast.success(`保存版本信息成功`);
      return true;
    } catch (err) {
      toast.error(JSON.stringify((err as { message: string }).message));
      return false;
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  // 转换为 ImageEditCell 需要的 pendingImages 格式
  const pendingImagesForCell: Record<string | number, { file: File; previewUrl: string }> = {};
  Object.entries(imageChanges).forEach(([id, change]) => {
    if (change.type === "new") {
      pendingImagesForCell[id] = { file: change.file, previewUrl: change.previewUrl };
    }
  });

  const columns: GridColDef[] = [
    {
      field: "image_url",
      headerName: "图片",
      width: 100,
      editable: true,
      renderCell: ({ value }) => <ImageViewCell value={value} />,
      renderEditCell: (params) => (
        <ImageEditCell
          {...params}
          pendingImages={pendingImagesForCell}
          onImageChange={handleImageChange}
        />
      ),
    },
    {
      field: "unit_name",
      headerName: "单位",
      editable: true,
      type: "singleSelect",
      valueOptions: GOODS_UNIT_NAMES,
      cellClassName: "basis-1/8",
      flex: 1,
    },
    {
      field: "price",
      headerName: "价格/元",
      type: "number",
      align: "left",
      headerAlign: "left",
      editable: true,
      cellClassName: "basis-1/8",
      flex: 1,
      renderCell: ({ row: { price } }) => {
        return <span>{((price ?? 0) / 100).toFixed(2)}</span>;
      },
    },
    {
      field: "count",
      headerName: "数量",
      editable: true,
      cellClassName: "basis-1/8",
      flex: 1,
    },
    {
      field: "status",
      headerName: "状态",
      editable: true,
      type: "singleSelect",
      valueOptions: GOODS_VERSION_STATUS_MAP,
      cellClassName: "basis-1/8",
      flex: 1,
    },
    {
      field: "version_number",
      headerName: "生产批次",
      editable: true,
      cellClassName: "basis-1/8",
      flex: 1,
    },
    {
      field: "bar_code",
      headerName: "条形码",
      editable: true,
      cellClassName: "basis-1/8",
      flex: 1,
    },
    {
      field: "supplier",
      headerName: "供应商",
      editable: true,
      cellClassName: "basis-1/8",
      flex: 1,
    },
  ];

  return (
    <Box sx={{ flexGrow: 1 }} mt={2}>
      <Typography variant="h6" gutterBottom>
        商品版本
      </Typography>
      <EditableTable
        pagination={pagination}
        initialEmptyData={InitialGoodsVersion({ goods_id: goodsId })}
        columns={columns}
        loading={loading}
        submitting={submitting}
        pendingImages={pendingImagesForCell}
        onImageChange={handleImageChange}
        onImageReset={handleImageReset}
        onChange={(payload, file) => handleSaveClick(payload as unknown as GoodsVersionType, file)}
        onDelete={() => {}}
      />
    </Box>
  );
}
