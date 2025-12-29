import React, { useEffect, useState, useRef } from "react";
import { Box, Typography, CircularProgress, Button } from "@mui/material";
import { get, post } from "src/lib/http";
import { toast } from "react-toastify";
// eslint-disable-next-line import/no-extraneous-dependencies
import QRCode from "qrcode";

interface QrCodeLoginProps {
  onSuccess: (res: { user: never; resources: [] }) => void;
}

enum QrCodeStatus {
  PENDING = "pending",
  SCANNED = "scanned",
  CONFIRMED = "confirmed",
  EXPIRED = "expired",
}

interface QrCodeData {
  qrCodeId: string;
  qrCodeContent: string;
  expiresIn: number;
}

// eslint-disable-next-line react/function-component-definition
const QrCodeLogin: React.FC<QrCodeLoginProps> = ({ onSuccess }) => {
  const [qrCodeData, setQrCodeData] = useState<QrCodeData | null>(null);
  const [status, setStatus] = useState<QrCodeStatus>(QrCodeStatus.PENDING);
  const [countdown, setCountdown] = useState<number>(60);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // 停止轮询
  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  };

  // 开始轮询
  const startPolling = (qrCodeId: string) => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    pollingRef.current = setInterval(async () => {
      try {
        const response = await get<{
          message: string;
          status?: QrCodeStatus;
          data?: never;
          remainingTime?: number;
          resources: [];
        }>(`/api/auth/qr-code/status/${qrCodeId}`);

        // 获取状态（可能在顶层或 data 中）
        const newStatus = response.status;
        const user = response.data;

        if (newStatus) {
          setStatus(newStatus);
        }

        if (newStatus === QrCodeStatus.CONFIRMED) {
          if (user) {
            stopPolling();
            onSuccess({ user, resources: response.resources });
            toast.success("扫码登录成功！");
          } else {
            console.error("完整响应:", JSON.stringify(response, null, 2));
          }
        } else if (newStatus === QrCodeStatus.EXPIRED) {
          stopPolling();
        }
      } catch (err) {
        console.error("❌ 查询二维码状态失败:", err);
      }
    }, 1000);
  };

  // 开始倒计时
  const startCountdown = (seconds: number) => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    let remaining = seconds;
    countdownRef.current = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);

      if (remaining <= 0) {
        clearInterval(countdownRef.current!);
        setStatus(QrCodeStatus.EXPIRED);
        stopPolling();
      }
    }, 1000);
  };

  // 生成二维码
  const generateQrCode = async () => {
    try {
      setLoading(true);
      setError(null);
      setStatus(QrCodeStatus.PENDING);

      const response = await post<{ data: QrCodeData }>({
        url: "/api/auth/qr-code/generate",
        config: {},
        payload: {},
      });

      setQrCodeData(response.data);
      setCountdown(response.data.expiresIn);
      setRetryCount(0); // 重置重试次数

      // 生成二维码到 canvas
      if (canvasRef.current) {
        const qrContent = JSON.stringify({
          type: "qr-login",
          qrCodeId: response.data.qrCodeId,
        });

        // 使用 qrcode 库生成二维码
        await QRCode.toCanvas(canvasRef.current, qrContent, {
          width: 200,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });
      }

      setLoading(false);

      // 开始轮询
      startPolling(response.data.qrCodeId);
      // 开始倒计时
      startCountdown(response.data.expiresIn);
    } catch (err: unknown) {
      const errorMessage = "生成二维码失败";
      setError(errorMessage);
      setLoading(false);

      // 🔑 自动重试（最多3次）
      if (retryCount < 3) {
        const delay = (retryCount + 1) * 1000; // 1s, 2s, 3s
        toast.warning(`生成失败，${delay / 1000}秒后重试...`);

        setTimeout(() => {
          setRetryCount(retryCount + 1);
          generateQrCode();
        }, delay);
      } else {
        // 达到最大重试次数
        toast.error(`${errorMessage}，请手动刷新`);
        setQrCodeData(null); // 确保显示重试按钮
      }
    }
  };

  // 刷新二维码
  const handleRefresh = () => {
    stopPolling();
    setRetryCount(0); // 重置重试次数
    generateQrCode().then();
  };

  // 初始化
  useEffect(() => {
    generateQrCode().then();

    return () => {
      stopPolling();
    };
  }, []);

  // 渲染状态提示
  const renderStatusText = () => {
    switch (status) {
      case QrCodeStatus.PENDING:
        return (
          <Typography variant="body2" color="text.secondary" align="center">
            请使用微信小程序扫描二维码
          </Typography>
        );
      case QrCodeStatus.SCANNED:
        return (
          <Typography variant="body2" color="primary" align="center">
            已扫描，请在小程序中确认登录
          </Typography>
        );
      case QrCodeStatus.EXPIRED:
        return (
          <Typography variant="body2" color="error" align="center">
            二维码已过期
          </Typography>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight={300}
        gap={2}
      >
        <CircularProgress />
        {retryCount > 0 && (
          <Typography variant="caption" color="text.secondary">
            正在重试... ({retryCount}/3)
          </Typography>
        )}
      </Box>
    );
  }

  if (error || !qrCodeData) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight={300}
        gap={2}
      >
        {error && (
          <Typography variant="body2" color="error" align="center">
            {error}
          </Typography>
        )}
        <Button variant="contained" onClick={handleRefresh}>
          {error ? "重新生成二维码" : "生成二维码"}
        </Button>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight={300}
      gap={2}
    >
      {/* 二维码容器 */}
      <Box position="relative" p={2} bgcolor="white" borderRadius={2} boxShadow={1}>
        {/* 二维码 Canvas */}
        <Box
          sx={{
            opacity: status === QrCodeStatus.EXPIRED ? 0.3 : 1,
            transition: "opacity 0.3s",
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              display: "block",
            }}
          />
        </Box>

        {/* 过期遮罩 */}
        {status === QrCodeStatus.EXPIRED && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            bgcolor="rgba(255, 255, 255, 0.9)"
            borderRadius={2}
          >
            <Typography variant="body1" color="error" mb={2}>
              二维码已过期
            </Typography>
            <Button variant="contained" size="small" onClick={handleRefresh}>
              刷新二维码
            </Button>
          </Box>
        )}
      </Box>

      {/* 状态提示 */}
      {renderStatusText()}

      {/* 倒计时 */}
      {status !== QrCodeStatus.EXPIRED && (
        <Typography variant="caption" color="text.secondary">
          {countdown}秒后过期
        </Typography>
      )}

      {/* 刷新按钮 */}
      {status === QrCodeStatus.PENDING && (
        <Button variant="text" size="small" onClick={handleRefresh}>
          刷新二维码
        </Button>
      )}
    </Box>
  );
};

export default QrCodeLogin;
