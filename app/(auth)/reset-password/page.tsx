"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // Exchange the recovery code for a session on mount
  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace("#", ""));
    const searchParams = new URLSearchParams(window.location.search);

    // Supabase sends the recovery code in the URL hash or query
    const code = searchParams.get("code") || params.get("code");
    const type = searchParams.get("type") || params.get("type");

    if (code && type === "recovery") {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          setError("链接已过期或无效，请重新找回密码");
        }
        setChecking(false);
      });
    } else {
      setChecking(false);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("两次输入的密码不一致");
      return;
    }
    if (password.length < 6) {
      setError("密码至少 6 位");
      return;
    }

    setError("");
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError("密码重置失败：" + error.message);
    } else {
      setDone(true);
      toast.success("密码已重置！请用新密码登录");
    }

    setLoading(false);
  }

  if (done) {
    return (
      <Card>
        <CardHeader>
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="size-6 text-primary" />
          </div>
          <CardTitle className="text-center">密码重置成功</CardTitle>
          <CardDescription className="text-center">
            现在可以用新密码登录你的账号了
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button className="w-full" onClick={() => router.push("/login")}>
            去登录
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (checking) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">验证链接中...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>重置密码</CardTitle>
        <CardDescription>设置一个新的登录密码</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">新密码</Label>
            <Input
              id="password"
              type="password"
              placeholder="至少 6 位"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">确认新密码</Label>
            <Input
              id="confirm"
              type="password"
              placeholder="再次输入新密码"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "重置中..." : "重置密码"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
