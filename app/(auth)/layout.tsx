import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-4">
      <Link href="/" className="mb-8 flex items-center gap-2 text-xl font-bold text-foreground">
        <span className="text-2xl">🧋</span>
        奶茶派对
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
