import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { format } from "date-fns";
import {
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { Scrollbar } from "src/components/scrollbar";
import { UserOrderType } from "src/types/store.type";
import EyeIcon from "@heroicons/react/24/solid/EyeIcon";
import CheckCircleIcon from "@heroicons/react/24/solid/CheckCircleIcon";
import TruckIcon from "@heroicons/react/24/solid/TruckIcon";
import XCircleIcon from "@heroicons/react/24/solid/XCircleIcon";
import { post, get } from "src/lib/http";
import { toast } from "react-toastify";
import ConfirmDialog from "src/components/dialog/confirm-dialog";
import { OrderHistoryDialog } from "./order-history-dialog";

// 订单商品明细类型
interface OrderItemDetail {
  id: number;
  order_info_id: string;
  order_id: string;
  goods_id: string;
  goods_name: string;
  goods_version_id: string;
  count: number;
  price: number;
  create_date?: string;
  update_date?: string;
  // 联查的商品版本信息
  version?: {
    version_id: string;
    goods_id: string;
    image_url?: string;
    version_number?: string;
    bar_code?: string;
    count: number;
    price: number;
    unit_name: string;
    supplier?: string;
    status: number;
  } | null;
  // 联查的商品基本信息
  goods?: {
    goods_id: string;
    name: string;
    description?: string;
    category_id: string;
    store_id: string;
  } | null;
}

// 订单状态配置
const ORDER_STATUS_CONFIG = {
  0: { label: "待支付", color: "warning" },
  1: { label: "待发货", color: "info" },
  2: { label: "配送中", color: "primary" },
  3: { label: "已完成", color: "success" },
  4: { label: "已取消", color: "error" },
  5: { label: "退款中", color: "warning" },
};

// 订单阶段配置
const ORDER_STAGE_CONFIG = {
  1: { label: "待处理", color: "default" },
  2: { label: "已接单", color: "primary" },
  3: { label: "配送中", color: "warning" },
  4: { label: "已接收", color: "error" },
  5: { label: "已完成", color: "success" },
};

function OrderDetailTableBody(props: {
  loadingDetails: boolean;
  orderDetails: OrderItemDetail[];
  selectedOrder: { money: number };
}) {
  const { loadingDetails, orderDetails, selectedOrder } = props;

  if (loadingDetails) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (orderDetails.length > 0) {
    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>商品名称</TableCell>
            <TableCell>规格信息</TableCell>
            <TableCell>商品ID</TableCell>
            <TableCell align="right">单价</TableCell>
            <TableCell align="right">数量</TableCell>
            <TableCell align="right">小计</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orderDetails.map((item) => (
            <TableRow key={item.order_info_id}>
              <TableCell>
                <Stack spacing={0.5}>
                  <Typography variant="body2" fontWeight="medium">
                    {item.goods?.name || item.goods_name}
                  </Typography>
                  {item.goods?.description && (
                    <Typography variant="caption" color="textSecondary">
                      {item.goods.description}
                    </Typography>
                  )}
                </Stack>
              </TableCell>
              <TableCell>
                <Stack spacing={0.5}>
                  {item.version?.unit_name && (
                    <Typography variant="body2">规格: {item.version.unit_name}</Typography>
                  )}
                  {item.version?.version_number && (
                    <Typography variant="caption" color="textSecondary">
                      版本: {item.version.version_number}
                    </Typography>
                  )}
                  {item.version?.bar_code && (
                    <Typography variant="caption" color="textSecondary">
                      条码: {item.version.bar_code}
                    </Typography>
                  )}
                </Stack>
              </TableCell>
              <TableCell>
                <Typography variant="caption" color="textSecondary">
                  {item.goods_id}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2">¥{(item.price / 100).toFixed(2)}</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2">{item.count}</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" color="primary" fontWeight="bold">
                  ¥{((item.price * item.count) / 100).toFixed(2)}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={5} align="right">
              <Typography variant="h6">订单总额：</Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="h6" color="primary">
                ¥{(selectedOrder.money / 100).toFixed(2)}
              </Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  return (
    <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
      暂无商品信息
    </Typography>
  );
}

export function StoreOrderTable(props: {
  onDeselectAll: () => void;
  onDeselectOne: (id: string) => void;
  onSelectAll: () => void;
  onSelectOne: (id: string) => void;
  selected: string[];
  setTrigger: () => void;
  defaultFiltered?: { id: string; value: unknown }[];
}) {
  const {
    onDeselectAll,
    onDeselectOne,
    onSelectAll,
    onSelectOne,
    selected = [],
    setTrigger,
    defaultFiltered,
  } = props;

  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(5);
  const [rows, setRows] = React.useState(0);
  const [data, setData] = React.useState<UserOrderType[]>([]);
  const [filtered, setFiltered] = React.useState<{ id: string; value: unknown }[]>(
    defaultFiltered ?? [],
  );

  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<UserOrderType | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderItemDetail[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [historyOrderId, setHistoryOrderId] = useState<string>("");
  const [historyOrderNumber, setHistoryOrderNumber] = useState<string>("");

  const selectedSome = selected.length > 0 && selected.length < data.length;
  const selectedAll = data.length > 0 && selected.length === data.length;

  const loadData = useCallback(() => {
    setLoading(true);
    post<{ pages: number; rows: number; data: UserOrderType[] }>({
      url: "/api/store/order/pagination",
      payload: { pageNum: page, pageSize, filtered, sorted: [] },
    })
      .then((res) => {
        setRows(res.rows);
        setData(res.data);
      })
      .catch((err) => toast.error(err.message || "加载数据失败"))
      .finally(() => setLoading(false));

    setTrigger();
  }, [page, pageSize, filtered]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePageChange = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = useCallback(
    (event: { target: { value: React.SetStateAction<number> } }) => {
      setPageSize(event.target.value);
    },
    [],
  );

  // 查看订单详情
  const handleViewDetail = async (order: UserOrderType) => {
    setSelectedOrder(order);
    setDetailDialogOpen(true);
    setLoadingDetails(true);
    setOrderDetails([]);

    try {
      const details = await get<OrderItemDetail[]>(`/api/store/order/detail/${order.order_id}`);
      setOrderDetails(details);
    } catch (err) {
      toast.error((err as { message: string }).message || "加载订单详情失败");
    } finally {
      setLoadingDetails(false);
    }
  };

  // 接单
  const handleAcceptOrder = async (orderId: string) => {
    try {
      await post({
        url: "/api/store/order/accept",
        payload: { order_id: orderId },
      });
      toast.success("接单成功");
      loadData();
    } catch (err) {
      toast.error((err as { message: string }).message || "接单失败");
    }
  };

  // 发货
  const handleShipOrder = async (orderId: string) => {
    try {
      await post({
        url: "/api/store/order/ship",
        payload: { order_id: orderId },
      });
      toast.success("发货成功");
      loadData();
    } catch (err) {
      toast.error((err as { message: string }).message || "发货失败");
    }
  };

  // 完成订单
  const handleCompleteOrder = async (orderId: string) => {
    try {
      await post({
        url: "/api/store/order/complete",
        payload: { order_id: orderId },
      });
      toast.success("订单已完成");
      loadData();
    } catch (err) {
      toast.error((err as { message: string }).message || "操作失败");
    }
  };

  // 取消订单
  const handleCancelOrder = async (orderId: string) => {
    try {
      await post({
        url: "/api/store/order/cancel",
        payload: { order_id: orderId },
      });
      toast.success("订单已取消");
      loadData();
    } catch (err) {
      toast.error((err as { message: string }).message || "取消失败");
    }
  };

  // 渲染操作按钮
  const renderActionButtons = (order: UserOrderType) => {
    const buttons = [];

    // 待处理状态 - 显示接单和取消按钮
    if (order.stage === 1) {
      buttons.push(
        <ConfirmDialog
          ButtonIcon={
            <Tooltip key="accept" title="接单">
              <IconButton size="small" color="success">
                <CheckCircleIcon style={{ width: 20, height: 20 }} />
              </IconButton>
            </Tooltip>
          }
          confirmFunc={() => handleAcceptOrder(order.order_id)}
          title="确认接单"
          content={`确定接单 ${order.order_id} 吗？`}
        />,
      );
      buttons.push(
        <ConfirmDialog
          ButtonIcon={
            <Tooltip key="cancel" title="取消订单">
              <IconButton size="small" color="error">
                <XCircleIcon style={{ width: 20, height: 20 }} />
              </IconButton>
            </Tooltip>
          }
          title="确认取消订单"
          content={`确定取消订单 ${order.order_id} 吗？`}
          confirmFunc={() => handleCancelOrder(order.order_id)}
        />,
      );
    }

    // 处理中状态 - 显示发货按钮
    if (order.stage === 2) {
      buttons.push(
        <ConfirmDialog
          ButtonIcon={
            <Tooltip key="ship" title="发货">
              <IconButton size="small" color="primary">
                <TruckIcon style={{ width: 20, height: 20 }} />
              </IconButton>
            </Tooltip>
          }
          title="确认发货"
          content={`确认发货 ${order.order_id} 吗？`}
          confirmFunc={() => handleShipOrder(order.order_id)}
        />,
      );
    }

    // 配送中状态 - 显示完成按钮
    if (order.status === 3) {
      buttons.push(
        <ConfirmDialog
          ButtonIcon={
            <Tooltip key="complete" title="完成订单">
              <IconButton size="small" color="success">
                <CheckCircleIcon style={{ width: 20, height: 20 }} />
              </IconButton>
            </Tooltip>
          }
          title="完成订单"
          content={`确认完成订单 ${order.order_id} 吗？`}
          confirmFunc={() => handleCompleteOrder(order.order_id)}
        />,
      );
    }

    return buttons;
  };

  return (
    <>
      <Card>
        <Scrollbar>
          <Box sx={{ minWidth: 800 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedAll}
                      indeterminate={selectedSome}
                      onChange={(event) => {
                        if (event.target.checked) {
                          onSelectAll?.();
                        } else {
                          onDeselectAll?.();
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>订单号</TableCell>
                  <TableCell>商铺</TableCell>
                  <TableCell>用户</TableCell>
                  <TableCell>收货地址</TableCell>
                  <TableCell>金额</TableCell>
                  <TableCell>状态</TableCell>
                  <TableCell>进度</TableCell>
                  <TableCell>下单时间</TableCell>
                  <TableCell>送达时间</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((order) => {
                  const isSelected = selected.includes(order.order_id);
                  const statusConfig = ORDER_STATUS_CONFIG[order.status] || {
                    label: "未知",
                    color: "default",
                  };
                  const stageConfig = ORDER_STAGE_CONFIG[order.stage] || {
                    label: "未知",
                    color: "default",
                  };

                  return (
                    <TableRow hover key={order.id} selected={isSelected}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected}
                          onChange={(event) => {
                            if (event.target.checked) {
                              onSelectOne?.(order.order_id);
                            } else {
                              onDeselectOne?.(order.order_id);
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                        <Link
                          component="button"
                          variant="subtitle2"
                          onClick={() => {
                            setHistoryOrderId(order.order_id);
                            setHistoryOrderNumber(order.order_id);
                            setHistoryDialogOpen(true);
                          }}
                          sx={{
                            cursor: "pointer",
                            textDecoration: "none",
                            "&:hover": {
                              textDecoration: "underline",
                            },
                          }}
                        >
                          {order.order_id}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Typography color="darkorange">
                          {/* eslint-disable-next-line no-underscore-dangle */}
                          {order?._store?.store_name || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {order.recipient}
                        <br />
                        <Typography variant="caption" color="textSecondary">
                          {order.phone}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" color="secondary">
                          {order.province}
                          {order.city}
                          {order.area}
                        </Typography>
                        <Typography variant="subtitle2" color="secondary">
                          {order.town}
                          {order.address}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" color="primary">
                          ¥{(order.money / 100).toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statusConfig.label}
                          color={statusConfig.color as never}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={stageConfig.label}
                          color={stageConfig.color as never}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {format(new Date(order.create_date), "yyyy-MM-dd")}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {format(new Date(order.create_date), "HH:mm:ss")}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {format(new Date(order.delivery_date), "yyyy-MM-dd")}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {format(new Date(order.delivery_date), "HH:mm:ss")}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          <Button>
                            <Tooltip title="查看详情">
                              <IconButton size="small" onClick={() => handleViewDetail(order)}>
                                <EyeIcon style={{ width: 20, height: 20 }} />
                              </IconButton>
                            </Tooltip>
                          </Button>
                          {renderActionButtons(order)}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        </Scrollbar>
        <TablePagination
          component="div"
          count={rows}
          onPageChange={handlePageChange}
          onRowsPerPageChange={() => {}}
          page={page}
          rowsPerPage={pageSize}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="每页显示："
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / 共 ${count} 条`}
        />
      </Card>

      {/* 订单详情对话框 */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">订单详情</Typography>
            {selectedOrder && (
              <Chip
                label={ORDER_STATUS_CONFIG[selectedOrder.status]?.label || "未知"}
                color={ORDER_STATUS_CONFIG[selectedOrder.status]?.color as never}
                size="small"
              />
            )}
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Stack spacing={3}>
              {/* 基本信息 */}
              <Card variant="outlined">
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    订单信息
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        订单号
                      </Typography>
                      <Typography variant="body1">{selectedOrder.order_id}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        商铺名称
                      </Typography>
                      <Typography variant="body1">
                        {/* eslint-disable-next-line no-underscore-dangle */}
                        {selectedOrder?._store?.store_name || "-"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        订单状态
                      </Typography>
                      <Typography variant="body1">
                        {ORDER_STATUS_CONFIG[selectedOrder.status]?.label || "未知"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        订单阶段
                      </Typography>
                      <Typography variant="body1">
                        {ORDER_STAGE_CONFIG[selectedOrder.stage]?.label || "未知"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        下单时间
                      </Typography>
                      <Typography variant="body1">
                        {format(new Date(selectedOrder.create_date), "yyyy-MM-dd HH:mm:ss")}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        配送时间
                      </Typography>
                      <Typography variant="body1">
                        {format(new Date(selectedOrder.delivery_date), "yyyy-MM-dd HH:mm:ss")}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Card>

              {/* 收货人信息 */}
              <Card variant="outlined">
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    收货信息
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        收货人
                      </Typography>
                      <Typography variant="body1">{selectedOrder.recipient}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        联系电话
                      </Typography>
                      <Typography variant="body1">{selectedOrder.phone}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">
                        收货地址
                      </Typography>
                      <Typography variant="body1">
                        {selectedOrder.province}
                        {selectedOrder.city}
                        {selectedOrder.area}
                        {selectedOrder.town}
                        {selectedOrder.address}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Card>

              {/* 商品明细 */}
              <Card variant="outlined">
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    商品明细
                  </Typography>
                  <OrderDetailTableBody
                    loadingDetails={loadingDetails}
                    orderDetails={orderDetails}
                    selectedOrder={selectedOrder}
                  />
                </Box>
              </Card>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>

      {/* 订单历史时间线对话框 */}
      <OrderHistoryDialog
        open={historyDialogOpen}
        onClose={() => setHistoryDialogOpen(false)}
        orderId={historyOrderId}
        orderNumber={historyOrderNumber}
      />
    </>
  );
}

StoreOrderTable.propTypes = {
  onDeselectAll: PropTypes.func,
  onDeselectOne: PropTypes.func,
  onSelectAll: PropTypes.func,
  onSelectOne: PropTypes.func,
  selected: PropTypes.array,
  defaultFiltered: PropTypes.array,
};
