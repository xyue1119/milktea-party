"use client";

import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteButton({ recordId, drinkId }: { recordId: string; drinkId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("records").delete().eq("id", recordId);
    if (error) {
      alert("删除失败：" + error.message);
      setConfirming(false);
      return;
    }

    // 同步删除评价
    await supabase.from("reviews").delete().eq("user_id", user!.id).eq("drink_id", drinkId);

    router.refresh();
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-muted-foreground/30 hover:text-destructive transition-colors"
        title="删除"
      >
        <Trash2 className="size-3.5" />
      </button>
    );
  }

  return (
    <span className="flex items-center gap-1 text-xs">
      <span className="text-muted-foreground">确定？</span>
      <button
        type="button"
        onClick={handleDelete}
        className="text-destructive font-medium hover:underline"
      >
        删除
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="text-muted-foreground hover:text-foreground"
      >
        取消
      </button>
    </span>
  );
}
