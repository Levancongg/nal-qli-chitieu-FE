const nodemailer = require("nodemailer");

// Cấu hình transporter cho nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com", // Thay bằng email của bạn
    pass: process.env.EMAIL_PASSWORD || "your-app-password", // Thay bằng mật khẩu ứng dụng
  },
  tls: {
    rejectUnauthorized: false, // Cho phép kết nối không an toàn trong môi trường dev
  },
})

// Hàm gửi email chứa mã OTP
export const sendOTPEmail = async (email: string, otp: string): Promise<boolean> => {
  try {
    // Tạo nội dung email
    const mailOptions = {
      from: process.env.EMAIL_USER || "your-email@gmail.com",
      to: email,
      subject: "Mã xác nhận đặt lại mật khẩu - QuanLyChiTieu",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333; text-align: center;">Đặt lại mật khẩu</h2>
          <p>Xin chào,</p>
          <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản QuanLyChiTieu. Vui lòng sử dụng mã xác nhận dưới đây:</p>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>Mã xác nhận này có hiệu lực trong vòng 10 phút.</p>
          <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
          <p style="margin-top: 30px; font-size: 12px; color: #777; text-align: center;">
            © 2024 QuanLyChiTieu. Tất cả quyền được bảo lưu.
          </p>
        </div>
      `,
    }

    // Gửi email
    const info = await transporter.sendMail(mailOptions)
    console.log("Email sent: ", info.response)
    return true
  } catch (error) {
    console.error("Error sending email: ", error)
    return false
  }
}

// Hàm giả lập gửi email cho môi trường phát triển
export const mockSendOTPEmail = (email: string, otp: string): boolean => {
  console.log(`[MOCK EMAIL] Sending OTP to ${email}: ${otp}`)
  return true
}
