import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { isAppRole } from "@/lib/auth/roles";
import { canAccessRoute } from "@/lib/auth/permissions";

export default async function proxy(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/administracion");
  const isAuthPage = pathname.startsWith("/auth/login") || pathname.startsWith("/auth/registro");

  if (isAdminRoute && !user) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && user) {
    return NextResponse.redirect(new URL("/administracion", request.url));
  }

  if (pathname.startsWith("/auth/sin-acceso")) {
    return response;
  }

  // Validación RBAC de autorización para rutas en /administracion
  if (isAdminRoute && user) {
    // Permitir acceso siempre a la página de no-autorizado para evitar bucles de redirección
    if (pathname === "/administracion/no-autorizado") {
      return response;
    }

    const { data: profile } = await supabase
      .from("perfiles")
      .select("rol, activo")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || !profile.activo || !isAppRole(profile.rol)) {
      return NextResponse.redirect(new URL("/auth/sin-acceso", request.url));
    }

    if (!canAccessRoute(profile.rol, pathname)) {
      return NextResponse.redirect(
        new URL("/administracion/no-autorizado", request.url)
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/administracion/:path*",
    "/auth/login",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
