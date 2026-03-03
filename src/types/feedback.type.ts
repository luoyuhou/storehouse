export interface FeedbackUserInfo {
  user_id: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  email?: string | null;
}

interface FeedbackAttachmentItem {
  id: number;
  feedback_id: number;
  url: string;
  type: number; // 1=image, 2=video
  description?: string | null;
}

export interface FeedbackItem {
  id: number;
  user_id: string;
  user?: FeedbackUserInfo | null;
  title: string;
  content: string;
  category?: string | null;
  status: number;
  create_date?: string | null;
  update_date?: string | null;
  attachments?: FeedbackAttachmentItem[];
}

export interface FeedbackCommentItem {
  id: number;
  feedback_id: number;
  user_id: string;
  first_name: string;
  last_name: string;
  content: string;
  parent_id?: number | null;
  create_date?: string | null;
  update_date?: string | null;
  user?: FeedbackUserInfo | null;
}
