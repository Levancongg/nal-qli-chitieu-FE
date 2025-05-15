// Kiểm tra xem đang chạy ở client hay server
const isClient = typeof window !== "undefined"

// Khóa bí mật để ký JWT
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Thời gian hết hạn của token (7 ngày)
const JWT_EXPIRES_IN = "7d"

// Giải pháp thay thế cho client-side
function createClientToken(payload: any): string {
  // Tạo một token đơn giản cho client-side
  const token = btoa(
    JSON.stringify({
      ...payload,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 ngày
    }),
  )
  return token
}

function verifyClientToken(token: string): any {
  try {
    // Giải mã token đơn giản
    const decoded = JSON.parse(atob(token))

    // Kiểm tra hết hạn
    if (decoded.exp && decoded.exp < Date.now()) {
      return null
    }

    return decoded
  } catch (error) {
    return null
  }
}

// Tạo JWT token
export const createToken = (payload: any): string => {
  if (isClient) {
    return createClientToken(payload)
  }

  // Server-side code (không chạy ở client)
  try {
    // Động import jsonwebtoken chỉ khi ở server-side
    const jwt = require("jsonwebtoken")
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
  } catch (error) {
    console.error("JWT sign error:", error)
    return createClientToken(payload) // Fallback to client token
  }
}

// Xác thực JWT token
export const verifyToken = (token: string): any => {
  if (isClient) {
    return verifyClientToken(token)
  }

  // Server-side code (không chạy ở client)
  try {
    const jwt = require("jsonwebtoken")
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    console.error("JWT verify error:", error)
    return verifyClientToken(token) // Fallback to client token verification
  }
}

// Giải mã JWT token mà không xác thực
export const decodeToken = (token: string): any => {
  if (isClient) {
    try {
      return JSON.parse(atob(token))
    } catch (error) {
      return null
    }
  }

  // Server-side code (không chạy ở client)
  try {
    const jwt = require("jsonwebtoken")
    return jwt.decode(token)
  } catch (error) {
    console.error("JWT decode error:", error)
    try {
      return JSON.parse(atob(token))
    } catch {
      return null
    }
  }
}
