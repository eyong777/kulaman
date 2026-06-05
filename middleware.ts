import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const protectedPrefixes = ["/admin", "/school-head", "/school"];

export async function middleware(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        }
      }
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtected = protectedPrefixes.some((prefix) => path.startsWith(prefix));

  if (isProtected && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", path);
    return NextResponse.redirect(redirectUrl);
  }

  if (user?.user_metadata?.must_change_password && path !== "/update-password") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/update-password";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  if (user && (path === "/login" || path === "/forgot-password")) {
    const redirectUrl = request.nextUrl.clone();
    const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
    redirectUrl.pathname =
      profile?.role === "admin" ? "/admin" : profile?.role === "school_head" ? "/school-head" : "/school";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
};
