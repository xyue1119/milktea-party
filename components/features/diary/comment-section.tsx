"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, MessageCircle } from "lucide-react";

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

interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles: { username: string; display_name: string | null } | null;
}

interface Props {
  recordId: string;
  initialComments: Comment[];
}

export function CommentSection({ recordId, initialComments }: Props) {
  const supabase = createClient();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
    });
  }, []);

  // 实时订阅新评论
  useEffect(() => {
    const channel = supabase
      .channel(`comments-${recordId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "comments", filter: `record_id=eq.${recordId}` },
        (payload) => {
          setComments((prev) => {
            // 去重 — 可能我们刚插入的也会广播
            if (prev.some((c) => c.id === (payload.new as any).id)) return prev;
            // 新评论先出现，需要补 profiles
            const c = payload.new as any;
            return [
              ...prev,
              {
                id: c.id,
                content: c.content,
                created_at: c.created_at,
                profiles: null, // realtime 不包含 join，补查
              },
            ];
          });
          // 补查 profile
          if ((payload.new as any).user_id) {
            supabase
              .from("profiles")
              .select("username, display_name")
              .eq("id", (payload.new as any).user_id)
              .single()
              .then(({ data }) => {
                if (data) {
                  setComments((prev) =>
                    prev.map((c) =>
                      c.id === (payload.new as any).id ? { ...c, profiles: data } : c
                    )
                  );
                }
              });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [recordId]);

  const handleSubmit = useCallback(async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("comments")
        .insert({ record_id: recordId, user_id: user!.id, content: content.trim() })
        .select("id, content, created_at, profiles:user_id(username, display_name)")
        .single();

      if (error) throw error;

      // 乐观已由 realtime 处理，这里做去重
      setComments((prev) => {
        if (prev.some((c) => c.id === data.id)) return prev;
        return [...prev, data as any];
      });
      setContent("");
    } catch (err: any) {
      alert("评论失败：" + (err.message || "未知错误"));
    } finally {
      setSubmitting(false);
    }
  }, [content, recordId]);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
        <MessageCircle className="size-3.5" />
        评论 ({comments.length})
      </h3>

      {/* 评论列表 */}
      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">暂无评论，来说点什么</p>
      ) : (
        <div className="space-y-2">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2 text-sm">
              <span className="font-medium text-foreground shrink-0">
                {c.profiles?.display_name || c.profiles?.username || "匿名"}
              </span>
              <span className="text-muted-foreground">{c.content}</span>
              <span className="text-[10px] text-muted-foreground/60 self-end shrink-0">
                {timeAgo(c.created_at)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 评论输入 */}
      {userId && (
        <div className="flex gap-2">
          <Textarea
            placeholder="写下你的评论..."
            rows={2}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button
            size="sm"
            className="shrink-0 mt-auto"
            disabled={submitting || !content.trim()}
            onClick={handleSubmit}
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
  );
}
