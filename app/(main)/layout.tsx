import { BookHeart, Store, CircleUser } from "lucide-react";
import Link from "next/link";
import { Coffee } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

const navTabs = [
  { icon: BookHeart, label: "吨吨本", href: "/diary" },
  { icon: Store, label: "菜单", href: "/catalog" },
  { icon: CircleUser, label: "我的", href: "/profile" },
];

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 获取头像 emoji
  let avatarEmoji: string | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .single();
    avatarEmoji = data?.avatar_url || null;
  }

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/50 bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <Link href="/diary" className="flex items-center gap-2">
            <Coffee className="size-5 text-primary" />
            <h1 className="text-lg font-bold text-foreground">奶茶派对</h1>
          </Link>
          <Link href="/profile" className="size-8 rounded-full bg-muted flex items-center justify-center text-lg select-none">
            {avatarEmoji || user?.user_metadata?.display_name?.[0] || "我"}
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 pb-16">{children}</main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-border/50 bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-around py-2">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center gap-0.5 px-5 py-1 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon className="size-5" strokeWidth={2} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
