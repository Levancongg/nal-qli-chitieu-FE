import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser } from "@/lib/db"
import { createToken } from "@/lib/jwt"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Kiểm tra các trường bắt buộc
    if (!email || !password) {
      return NextResponse.json({ error: "Vui lòng điền đầy đủ thông tin" }, { status: 400 })
    }

    // Xác thực người dùng
    const user = await authenticateUser(email, password)

    if (!user) {
      return NextResponse.json({ error: "Email hoặc mật khẩu không chính xác" }, { status: 401 })
    }

    // Tạo JWT token
    const token = createToken({ id: user.id, email: user.email })

    // Trả về thông tin người dùng và token
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Đã xảy ra lỗi khi đăng nhập" }, { status: 500 })
  }
}
