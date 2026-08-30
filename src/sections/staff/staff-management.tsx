import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  MenuItem,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { TrashIcon, PencilSquareIcon, PlusIcon } from "@heroicons/react/24/solid";
import { get, post, patch, del } from "src/lib/http";
import { toast } from "react-toastify";
import { StaffType } from "src/types/staff.type";
import LinearBufferLoading from "src/components/loading/linear-buffer.loading";
import { useFormik } from "formik";
import * as Yup from "yup";
import ConfirmDialog from "src/components/dialog/confirm-dialog";

export function StaffManagement({ storeId }: { storeId?: string }) {
  const [loading, setLoading] = useState<boolean>(false);
  const [list, setList] = useState<StaffType[]>([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffType | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (!storeId) return;

    setLoading(true);
    get<StaffType[]>(`/api/store/staff/list?storeId=${storeId}`)
      .then((res) => setList(res))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [storeId, trigger]);

  const handleDelete = (id: string) => {
    del(`/api/store/staff/${id}`)
      .then(() => {
        toast.success("删除成功");
        setTrigger((c) => c + 1);
      })
      .catch((err) => toast.error(err.message));
  };

  const formik = useFormik({
    initialValues: {
      name: editingStaff?.name || "",
      phone: editingStaff?.phone || "",
      status: editingStaff?.status ?? 1,
      can_cashier: editingStaff?.can_cashier ?? 0,
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().required("姓名必填"),
      phone: Yup.string().required("手机号必填"),
      status: Yup.number().required("状态必填"),
      can_cashier: Yup.number().oneOf([0, 1]).required(),
    }),
    onSubmit: async (values) => {
      const payload = { ...values, store_id: storeId };
      const promise = editingStaff
        ? patch({ url: `/api/store/staff/${editingStaff.staff_id}`, payload })
        : post({ url: "/api/store/staff", payload });

      promise
        .then(() => {
          toast.success(editingStaff ? "更新成功" : "添加成功");
          setOpenAdd(false);
          setEditingStaff(null);
          setTrigger((c) => c + 1);
        })
        .catch((err) => toast.error(err.message));
    },
  });

  if (!storeId) {
    return (
      <Card sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="body1" color="textSecondary">
          请在左侧选择一个门店以管理员工
        </Typography>
      </Card>
    );
  }

  return (
    <Card sx={{ minHeight: "500px" }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">员工列表</Typography>
          <Button
            startIcon={<PlusIcon style={{ width: 20 }} />}
            variant="contained"
            onClick={() => {
              setEditingStaff(null);
              setOpenAdd(true);
            }}
          >
            添加员工
          </Button>
        </Stack>

        <LinearBufferLoading loading={loading}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>姓名</TableCell>
                <TableCell>手机号</TableCell>
                <TableCell>收银权限</TableCell>
                <TableCell>状态</TableCell>
                <TableCell align="right">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {list.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    暂无员工
                  </TableCell>
                </TableRow>
              ) : (
                list.map((staff) => (
                  <TableRow key={staff.staff_id}>
                    <TableCell>{staff.name}</TableCell>
                    <TableCell>{staff.phone}</TableCell>
                    <TableCell>{(staff.can_cashier ?? 1) === 1 ? "是" : "否"}</TableCell>
                    <TableCell>{staff.status === 1 ? "启用" : "禁用"}</TableCell>
                    <TableCell
                      sx={{
                        display: "flex",
                        justifyContent: "right",
                        alignItems: "center",
                      }}
                    >
                      <Tooltip title="编辑">
                        <IconButton
                          onClick={() => {
                            setEditingStaff(staff);
                            setOpenAdd(true);
                          }}
                        >
                          <PencilSquareIcon style={{ width: 20 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="删除">
                        <ConfirmDialog
                          ButtonIcon={
                            <Tooltip key="complete" title="完成订单">
                              <IconButton size="small" color="error">
                                <TrashIcon style={{ width: 20, height: 20 }} />
                              </IconButton>
                            </Tooltip>
                          }
                          confirmFunc={() => handleDelete(staff.staff_id)}
                          title="删除员工"
                          content="确定删除该员工吗？"
                        />
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </LinearBufferLoading>
      </CardContent>

      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} fullWidth maxWidth="xs">
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>{editingStaff ? "编辑员工" : "添加员工"}</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="姓名"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
              <TextField
                fullWidth
                label="手机号"
                name="phone"
                value={formik.values.phone}
                onChange={formik.handleChange}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
              />
              <TextField
                fullWidth
                label="状态"
                name="status"
                select
                value={formik.values.status}
                onChange={formik.handleChange}
              >
                <MenuItem value={1}>启用</MenuItem>
                <MenuItem value={0}>禁用</MenuItem>
              </TextField>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.can_cashier === 1}
                    onChange={(_, checked) => formik.setFieldValue("can_cashier", checked ? 1 : 0)}
                    color="primary"
                  />
                }
                label="开通收银权限"
              />
              <Typography variant="caption" color="text.secondary">
                无收银权限仅可登录打卡；开通后可进入收银台
              </Typography>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAdd(false)}>取消</Button>
            <Button type="submit" variant="contained">
              确定
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Card>
  );
}
