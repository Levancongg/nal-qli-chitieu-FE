import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import { findUserById } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Token không được cung cấp" }, { status: 400 })
    }

    // Xác thực token
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Token không hợp lệ hoặc đã hết hạn" }, { status: 401 })
    }

    // Kiểm tra người dùng tồn tại
    const user = findUserById(decoded.id)
    if (!user) {
      return NextResponse.json({ error: "Người dùng không tồn tại" }, { status: 404 })
    }

    // Trả về thông tin người dùng
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Đã xảy ra lỗi khi xác thực token" }, { status: 500 })
  }
}
