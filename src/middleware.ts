import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth((req) => {
  const token = req.nextauth.token;
  if (req.nextUrl.pathname === "/store/create") {
    // if (!token?.verified) {
    //   return NextResponse.redirect(new URL("/profile/settings", req.url));
    // }
    if (token?.hasStore) {
      return NextResponse.redirect(new URL("/store", req.url));
    }
  }
  if (
    req.nextUrl.pathname === "/store" ||
    req.nextUrl.pathname === "/store/settings" ||
    req.nextUrl.pathname === "/store/orders" ||
    req.nextUrl.pathname === "/products/create"
  ) {
    // if (!token?.verified) {
    //   return NextResponse.redirect(new URL("/profile/settings", req.url));
    // }
    if (!token?.hasStore) {
      return NextResponse.redirect(new URL("/store/create", req.url));
    }
  }
});

export const config = {
  matcher: [
    "/store/:path*",
    "/profile/:path*",
    "/products/create",
    "/bag",
    "/pay",
    "/orders",
  ],
};
