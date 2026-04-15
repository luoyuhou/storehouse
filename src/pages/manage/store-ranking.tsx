import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import {
  Box,
  Container,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TablePagination,
  Avatar,
} from "@mui/material";
import { post } from "src/lib/http";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import CircularPercentageLoading from "src/components/loading/circular-percentage.loading";

type StoreRankingItem = {
  rank: number;
  store_id: string;
  store_name: string;
  store_status: number;
  rating: number;
  avg_star: number;
  order_count: number;
  updated_at: string;
};

const statusConfig: Record<
  number,
  { text: string; color: "success" | "warning" | "error" | "default" }
> = {
  1: { text: "正常", color: "success" },
  0: { text: "待审核", color: "warning" },
  [-1]: { text: "已禁用", color: "error" },
};

// 根据排名返回颜色
const getRankColor = (rank: number): string => {
  if (rank === 1) return "#FFD700"; // 金色
  if (rank === 2) return "#C0C0C0"; // 银色
  if (rank === 3) return "#CD7F32"; // 铜色
  return "transparent";
};

function StoreRankingPage() {
  const [loading, setLoading] = useState(false);
  const [rankingList, setRankingList] = useState<StoreRankingItem[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const loadRanking = async () => {
    setLoading(true);
    try {
      const res = await post<{
        message: string;
        data: {
          list: StoreRankingItem[];
          total: number;
          page: number;
          size: number;
        };
      }>({
        url: "/api/store/rating/ranking",
        payload: {
          pageNum: page,
          pageSize: rowsPerPage,
        },
      });

      setRankingList(res.data.list || []);
      setTotal(res.data.total);
    } catch (err) {
      toast.error((err as { message: string }).message || "加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRanking();
  }, [page, rowsPerPage]);

  const handleChangePage = useCallback(
    (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
      setPage(newPage);
    },
    [],
  );

  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  // 渲染评分星星
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const stars = [];

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <span key={i} style={{ color: "#FFB400" }}>
            ★
          </span>,
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <span key={i} style={{ color: "#FFB400" }}>
            ☆
          </span>,
        );
      } else {
        stars.push(
          <span key={i} style={{ color: "#ccc" }}>
            ☆
          </span>,
        );
      }
    }

    return <span style={{ fontSize: "16px" }}>{stars}</span>;
  };

  return (
    <>
      <Head>
        <title>店铺评分排名</title>
      </Head>
      <Box component="main" sx={{ flexGrow: 1, py: 2 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Typography variant="h4">店铺评分排名</Typography>

            {/* 排名列表 */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="center" width={80}>
                      排名
                    </TableCell>
                    <TableCell>店铺名称</TableCell>
                    <TableCell align="center">状态</TableCell>
                    <TableCell align="center">评分</TableCell>
                    <TableCell align="center">星级</TableCell>
                    <TableCell align="center">评价数</TableCell>
                    <TableCell align="center">更新时间</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <CircularPercentageLoading loading={loading}>
                    {rankingList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          暂无数据
                        </TableCell>
                      </TableRow>
                    ) : (
                      rankingList.map((item) => (
                        <TableRow
                          key={item.store_id}
                          sx={{
                            backgroundColor: getRankColor(item.rank),
                            "&:hover": { opacity: 0.9 },
                          }}
                        >
                          <TableCell align="center">
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {item.rank <= 3 ? (
                                <Avatar
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    bgcolor: getRankColor(item.rank),
                                    color: item.rank <= 3 ? "#fff" : "inherit",
                                    fontWeight: "bold",
                                    border: item.rank <= 3 ? "2px solid #fff" : "none",
                                  }}
                                >
                                  {item.rank}
                                </Avatar>
                              ) : (
                                <Typography>{item.rank}</Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight="medium">{item.store_name}</Typography>
                            <Typography variant="caption" color="textSecondary">
                              {item.store_id}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={statusConfig[item.store_status]?.text || "未知"}
                              color={statusConfig[item.store_status]?.color || "default"}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Typography fontWeight="bold" color="primary">
                              {item.rating.toFixed(1)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">{renderStars(item.avg_star)}</TableCell>
                          <TableCell align="center">
                            <Typography>{item.order_count}</Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" color="textSecondary">
                              {item.updated_at
                                ? dayjs(item.updated_at).format("YYYY-MM-DD HH:mm")
                                : "-"}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </CircularPercentageLoading>
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={total}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="每页行数"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} 共 ${count !== -1 ? count : `超过 ${to}`} 条`
                }
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </TableContainer>
          </Stack>
        </Container>
      </Box>
    </>
  );
}

StoreRankingPage.getLayout = (page: JSX.Element) => <DashboardLayout>{page}</DashboardLayout>;

export default StoreRankingPage;
