import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

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

  // getUser() refresca el token si está por expirar.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/administracion");
  const isLoginPage = pathname.startsWith("/auth/login");

  // Sin sesión → redirige al login
  if (isAdminRoute && !user) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", pathname); // para redirigir después del login
    return NextResponse.redirect(loginUrl);
  }

  // Ya autenticado → si intenta ir al login, lo mandamos al panel
  if (isLoginPage && user) {
    return NextResponse.redirect(new URL("/administracion", request.url));
  }

  return response;
}

export const config = {
  // Ejecuta el proxy solo en rutas relevantes;
  // excluye assets estáticos, imágenes y archivos.
  matcher: [
    "/administracion/:path*",
    "/auth/login",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
