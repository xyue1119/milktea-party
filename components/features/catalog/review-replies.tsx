"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, MessageCircle, X } from "lucide-react";

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "刚刚";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} 天前`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} 个月前`;
  return `${Math.floor(months / 12)} 年前`;
}

interface Reply {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: { username: string; display_name: string | null } | null;
}

export function ReviewReplies({ reviewId }: { reviewId: string }) {
  const supabase = createClient();
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyCount, setReplyCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
    });
    supabase
      .from("comments")
      .select("id", { count: "exact", head: true })
      .eq("review_id", reviewId)
      .then(({ count }) => setReplyCount(count || 0));
  }, [reviewId]);

  const loadReplies = useCallback(async () => {
    if (loaded) return;
    const { data } = await supabase
      .from("comments")
      .select("id, content, created_at, user_id, profiles:user_id(username, display_name)")
      .eq("review_id", reviewId)
      .order("created_at", { ascending: true });
    if (data) setReplies(data as any);
    setLoaded(true);
  }, [reviewId, loaded]);

  const handleToggle = () => {
    if (!open && !loaded) loadReplies();
    setOpen(!open);
  };

  const handleSubmit = useCallback(async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("comments")
        .insert({ review_id: reviewId, user_id: user!.id, content: content.trim() })
        .select("id, content, created_at, user_id, profiles:user_id(username, display_name)")
        .single();

      if (error) throw error;

      setReplies((prev) => [...prev, data as any]);
      setReplyCount((c) => c + 1);
      setContent("");
    } catch (err: any) {
      alert("回复失败：" + (err.message || "未知错误"));
    } finally {
      setSubmitting(false);
    }
  }, [content, reviewId]);

  const handleDeleteReply = async (replyId: string) => {
    const { error } = await supabase.from("comments").delete().eq("id", replyId);
    if (error) {
      alert("删除失败：" + error.message);
      return;
    }
    setReplies((prev) => prev.filter((r) => r.id !== replyId));
    setReplyCount((c) => c - 1);
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleToggle}
        className="inline-flex items-center gap-1.5 text-sm leading-none text-muted-foreground hover:text-blue-500 transition-colors"
      >
        <MessageCircle className="size-4" />
        <span>{replyCount > 0 ? replyCount : "回复"}</span>
      </button>

      {open && (
        <div className="w-full mt-3 pl-4 border-l-2 border-muted/60">
          {replies.length > 0 && (
            <div className="space-y-3 mb-4">
              {replies.map((r) => (
                <div key={r.id} className="group">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">
                      {r.profiles?.display_name || r.profiles?.username || "匿名"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(r.created_at)}
                    </span>
                    {userId && r.user_id === userId && (
                      <button
                        type="button"
                        onClick={() => handleDeleteReply(r.id)}
                        className="ml-auto opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                        title="删除"
                      >
                        <X className="size-3" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-foreground/75 mt-0.5 leading-relaxed">{r.content}</p>
                </div>
              ))}
            </div>
          )}

          {userId && (
            <div className="flex gap-2">
              <Textarea
                placeholder="写回复..."
                rows={2}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="text-sm min-h-0 resize-none flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <Button
                size="sm"
                disabled={submitting || !content.trim()}
                onClick={handleSubmit}
                className="shrink-0 mt-auto"
              >
                {submitting ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Send className="size-3.5" />
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
