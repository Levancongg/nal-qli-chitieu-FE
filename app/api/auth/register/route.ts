import { type NextRequest, NextResponse } from "next/server"
import { createUser, findUserByEmail } from "@/lib/db"
import { createToken } from "@/lib/jwt"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, confirmPassword } = await request.json()

    // Kiểm tra các trường bắt buộc
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json({ error: "Vui lòng điền đầy đủ thông tin" }, { status: 400 })
    }

    // Kiểm tra mật khẩu khớp nhau
    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Mật khẩu không khớp" }, { status: 400 })
    }

    // Kiểm tra email đã tồn tại chưa
    const existingUser = findUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "Email này đã được đăng ký" }, { status: 400 })
    }

    // Tạo người dùng mới
    const user = await createUser(name, email, password)

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
    console.error("Registration error:", error)
    return NextResponse.json({ error: error.message || "Đã xảy ra lỗi khi đăng ký" }, { status: 500 })
  }
}
