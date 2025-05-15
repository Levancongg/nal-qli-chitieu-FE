import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Danh sách các đường dẫn không cần xác thực
const publicPaths = ["/", "/login", "/register", "/forgot-password", "/reset-password"]

export function middleware(request: NextRequest) {
  // Kiểm tra xem đường dẫn hiện tại có phải là đường dẫn công khai không
  const isPublicPath = publicPaths.some(
    (path) => request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith("/api/auth/"),
  )

  // Lấy token từ cookie
  const token = request.cookies.get("authToken")?.value

  // Nếu là đường dẫn công khai và người dùng đã đăng nhập, chuyển hướng đến dashboard
  if (isPublicPath && token && request.nextUrl.pathname !== "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Nếu không phải đường dẫn công khai và người dùng chưa đăng nhập, chuyển hướng đến trang đăng nhập
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
