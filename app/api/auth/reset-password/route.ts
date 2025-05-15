import { type NextRequest, NextResponse } from "next/server"
import { resetPassword, verifyOTP } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { email, otp, password, confirmPassword } = await request.json()

    // Kiểm tra các trường bắt buộc
    if (!email || !otp || !password || !confirmPassword) {
      return NextResponse.json({ error: "Vui lòng điền đầy đủ thông tin" }, { status: 400 })
    }

    // Kiểm tra mật khẩu khớp nhau
    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Mật khẩu không khớp" }, { status: 400 })
    }

    // Xác thực OTP
    const isValidOTP = verifyOTP(email, otp)
    if (!isValidOTP) {
      return NextResponse.json({ error: "Mã OTP không hợp lệ hoặc đã hết hạn" }, { status: 400 })
    }

    // Đặt lại mật khẩu
    const success = await resetPassword(email, otp, password)

    if (!success) {
      return NextResponse.json({ error: "Không thể đặt lại mật khẩu" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Mật khẩu đã được đặt lại thành công",
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Đã xảy ra lỗi khi đặt lại mật khẩu" }, { status: 500 })
  }
}
