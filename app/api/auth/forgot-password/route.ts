import { type NextRequest, NextResponse } from "next/server"
import { createOTP, findUserByEmail } from "@/lib/db"
import { sendOTPEmail, mockSendOTPEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Kiểm tra email
    if (!email) {
      return NextResponse.json({ error: "Vui lòng nhập email" }, { status: 400 })
    }

    // Kiểm tra người dùng tồn tại
    const user = findUserByEmail(email)
    if (!user) {
      // Không tiết lộ thông tin về việc email có tồn tại hay không
      return NextResponse.json({
        success: true,
        message: "Nếu email tồn tại, bạn sẽ nhận được mã OTP qua email.",
      })
    }

    // Tạo OTP
    const otpInfo = createOTP(email)
    if (!otpInfo) {
      return NextResponse.json({ error: "Không thể tạo mã OTP" }, { status: 500 })
    }

    // Gửi email chứa OTP
    // Trong môi trường thực tế, sử dụng sendOTPEmail
    // Trong môi trường phát triển, sử dụng mockSendOTPEmail
    const isDev = process.env.NODE_ENV === "development"
    const emailSent = isDev ? mockSendOTPEmail(email, otpInfo.otp) : await sendOTPEmail(email, otpInfo.otp)

    if (!emailSent) {
      return NextResponse.json({ error: "Không thể gửi email" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Mã OTP đã được gửi đến email của bạn.",
      // Chỉ trả về OTP trong môi trường phát triển để dễ kiểm thử
      ...(isDev && { otp: otpInfo.otp }),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Đã xảy ra lỗi khi xử lý yêu cầu" }, { status: 500 })
  }
}
