import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const isAuth = !!token;
        const isAuthPage = req.nextUrl.pathname.startsWith("/login");

        if (isAuthPage) {
            if (isAuth) {
                return NextResponse.redirect(new URL("/dashboard", req.url));
            }
            return null;
        }

        if (!isAuth) {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        // Role-based protection example
        // if (req.nextUrl.pathname.startsWith("/admin") && token?.role !== "ADMIN") {
        //   return NextResponse.redirect(new URL("/dashboard", req.url));
        // }
    },
    {
        callbacks: {
            authorized: ({ token }) => true, // Handled inside middleware function for better control
        },
    }
);

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
