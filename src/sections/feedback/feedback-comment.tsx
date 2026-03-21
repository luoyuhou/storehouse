import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { get, post } from "src/lib/http";
import { toast } from "react-toastify";
import { FeedbackCommentItem, FeedbackItem } from "src/types/feedback.type";
import dayjs from "dayjs";

export function FeedbackComment({
  commentTarget,
  commentDialogOpen,
  setCommentDialogOpen,
}: {
  commentTarget: FeedbackItem | null;
  commentDialogOpen: boolean;
  setCommentDialogOpen: (val: boolean) => void;
}) {
  const [comments, setComments] = useState<FeedbackCommentItem[]>([]);
  const [commentContent, setCommentContent] = useState("");
  const [replyParentId, setReplyParentId] = useState<number | undefined>(undefined);
  const [commentLoading, setCommentLoading] = useState(false);

  const [trigger, setTrigger] = useState<number>(0);

  useEffect(() => {
    if (!commentDialogOpen || !commentTarget) return;

    get<{ data: FeedbackCommentItem[] }>(`/api/feedback/${commentTarget.feedback_id}/comments`)
      .then((res) => {
        setComments(res.data || []);
      })
      .catch((error) => {
        toast.error((error as { message?: string })?.message || "加载评论失败");
      })
      .finally(() => setCommentLoading(false));
  }, [commentDialogOpen, commentTarget, trigger]);

  return (
    <Dialog
      open={commentDialogOpen}
      onClose={() => {
        if (commentLoading) return;
        setCommentDialogOpen(false);
        setComments([]);
        setCommentContent("");
        setReplyParentId(undefined);
      }}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>{commentTarget ? `评论：${commentTarget.title}` : "评论"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Box
            sx={{
              maxHeight: 320,
              overflowY: "auto",
              border: "1px solid #eee",
              borderRadius: 1,
              p: 1,
            }}
          >
            {/* eslint-disable-next-line no-nested-ternary */}
            {commentLoading ? (
              <Typography variant="body2">加载中...</Typography>
            ) : comments.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                暂无评论
              </Typography>
            ) : (
              comments.map((c) => (
                <Box
                  key={c.id}
                  sx={{
                    mb: 1,
                    pl: c.parent_id ? 3 : 0,
                    borderLeft: c.parent_id ? "2px solid #eee" : "none",
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontSize: 12 }}>
                    {(() => {
                      if (c.user) {
                        const name = `${c.user.first_name ?? ""} ${c.user.last_name ?? ""}`.trim();
                        if (name) return name;
                        if (c.user.phone) return c.user.phone;
                        return c.user.user_id;
                      }
                      return c.user_id;
                    })()}
                    <Typography
                      component="span"
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 1 }}
                    >
                      {dayjs(c.create_date).format("YYYY-MM-DD HH:mm:ss")}
                    </Typography>
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: 13 }}>
                    {c.content}
                  </Typography>
                  <Button
                    size="small"
                    variant="text"
                    sx={{ mt: 0.5, fontSize: 12 }}
                    onClick={() => {
                      setReplyParentId(c.id);
                      const nick = `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim();
                      setCommentContent((prev) => prev || `@${nick} `);
                    }}
                  >
                    回复
                  </Button>
                </Box>
              ))
            )}
          </Box>

          <TextField
            label={replyParentId ? "回复内容" : "评论内容"}
            fullWidth
            multiline
            minRows={3}
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            if (commentLoading) return;
            setCommentDialogOpen(false);
            setComments([]);
            setCommentContent("");
            setReplyParentId(undefined);
          }}
        >
          关闭
        </Button>
        <Button
          variant="contained"
          disabled={!commentTarget || !commentContent.trim()}
          onClick={async () => {
            if (!commentTarget || !commentContent.trim()) return;
            try {
              const payload: { content: string; parent_id?: number } = {
                content: commentContent.trim(),
              };
              if (replyParentId) {
                payload.parent_id = replyParentId;
              }
              await post<{ data: FeedbackCommentItem }>({
                url: `/api/feedback/${commentTarget.feedback_id}/comments`,
                payload,
              });
              setTrigger((c) => c + 1);
              setCommentContent("");
              setReplyParentId(undefined);
              toast.success("评论已提交");
            } catch (error) {
              toast.error((error as { message?: string })?.message || "提交评论失败");
            }
          }}
        >
          提交
        </Button>
      </DialogActions>
    </Dialog>
  );
}
