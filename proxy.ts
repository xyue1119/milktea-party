import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isAuthPage = request.nextUrl.pathname.startsWith("/login")
    || request.nextUrl.pathname.startsWith("/signup")
    || request.nextUrl.pathname.startsWith("/callback");

  // 根路径 → 重定向到日记
  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/diary", request.url));
  }

  // 未登录 → 只能访问认证页
  if (!user && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 已登录 → 认证页重定向到日记
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/diary", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|illustrations|.*\\.svg).*)",
  ],
};
