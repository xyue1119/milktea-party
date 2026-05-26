"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

const emojis = [
  "🧋", "🍵", "🧊", "🍓", "🍑", "🥭", "🍋", "🍇", "🍉", "🍍",
  "🥛", "🍯", "🍪", "🎀", "⭐", "💫", "🌸", "🌺", "🐱", "🐰",
  "🦊", "🐻", "🐼", "🦄", "🍀", "🌈", "💜", "💚", "🩷", "☕",
  "💛", "🩵", "🌿", "🍃", "🍡", "🍰", "🧸", "🎧", "✨", "🔥",
];

export default function ProfileEditPage() {
  const router = useRouter();
  const supabase = createClient();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarEmoji, setAvatarEmoji] = useState("🧋");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login");
        return;
      }
      supabase
        .from("profiles")
        .select("display_name, bio, avatar_url")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setDisplayName(data.display_name || "");
            setBio(data.bio || "");
            setAvatarEmoji(data.avatar_url || "🧋");
          }
          setLoading(false);
        });
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim(),
        bio: bio.trim() || null,
        avatar_url: avatarEmoji,
      })
      .eq("id", user!.id);

    if (error) {
      alert("保存失败：" + error.message);
    } else {
      router.push("/profile");
      router.refresh();
    }
    setSaving(false);
  }

  if (loading) return null;

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/profile" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-5" />
        </Link>
        <h2 className="text-lg font-bold">编辑资料</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">个人信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 头像 emoji */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              头像 {avatarEmoji}
            </label>
            <div className="grid grid-cols-10 gap-1">
              {emojis.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setAvatarEmoji(e)}
                  className={`size-8 text-lg flex items-center justify-center rounded-md transition-colors ${
                    avatarEmoji === e
                      ? "bg-primary/15 ring-2 ring-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">昵称</label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="你的昵称"
              maxLength={30}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">简介</label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="介绍一下自己..."
              rows={3}
              maxLength={200}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">{bio.length}/200</p>
          </div>
          <Button className="w-full" onClick={handleSave} disabled={saving || !displayName.trim()}>
            {saving ? <Loader2 className="size-4 animate-spin mr-1" /> : null}
            保存
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
