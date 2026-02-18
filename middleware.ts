// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

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
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data } = await supabase.auth.getSession();
  const isLogged = !!data.session;

  const pathname = request.nextUrl.pathname;

  const isAuthPage = pathname.startsWith("/login");
  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/app") ||
    pathname.startsWith("/projetos") ||
    pathname.startsWith("/relatorios") ||
    pathname.startsWith("/organizations");

  if (isProtected && !isLogged) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // opcional: se já está logado, não deixa voltar pro /login
  if (isAuthPage && isLogged) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
