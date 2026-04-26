import { auth } from "../auth";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;

  const protectedPaths = ["/results", "/history"];
  const adminPaths = ["/admin"];
  const publicPaths = ["/share", "/plan"]; // accessibles sans auth

  const isPublic = publicPaths.some((p) => nextUrl.pathname.startsWith(p));
  if (isPublic) return; // pas de redirection

  const isProtected = protectedPaths.some((p) => nextUrl.pathname.startsWith(p));
  const isAdmin = adminPaths.some((p) => nextUrl.pathname.startsWith(p));

  if ((isProtected || isAdmin) && !isLoggedIn) {
    const loginUrl = new URL("/auth/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return Response.redirect(loginUrl);
  }

  if (isAdmin && session?.user?.role !== "ADMIN") {
    return Response.redirect(new URL("/", nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|auth).*)"],
};
