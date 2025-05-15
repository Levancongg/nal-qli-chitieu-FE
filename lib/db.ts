// Định nghĩa cấu trúc dữ liệu người dùng
export interface User {
  id: string
  name: string
  email: string
  password: string
  otp?: string
  otpExpiry?: number
}

// Định nghĩa cấu trúc dữ liệu database
interface Database {
  users: User[]
}

// Sử dụng localStorage thay vì file system trong môi trường client
const isClient = typeof window !== "undefined"

// Đọc database
export const readDatabase = (): Database => {
  if (isClient) {
    // Trong môi trường client, sử dụng localStorage
    const data = localStorage.getItem("userDatabase")
    if (!data) {
      const defaultData: Database = { users: [] }
      localStorage.setItem("userDatabase", JSON.stringify(defaultData))
      return defaultData
    }
    return JSON.parse(data) as Database
  } else {
    // Trong môi trường server, trả về database rỗng
    // Lưu ý: Trong môi trường thực tế, bạn nên sử dụng database thực sự
    return { users: [] }
  }
}

// Ghi database
export const writeDatabase = (data: Database): void => {
  if (isClient) {
    localStorage.setItem("userDatabase", JSON.stringify(data))
  }
  // Trong môi trường server, không làm gì cả
}

// Tìm người dùng theo email
export const findUserByEmail = (email: string): User | undefined => {
  if (!isClient) return undefined

  const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
  return registeredUsers.find((user: any) => user.email === email)
}

// Tìm người dùng theo ID
export const findUserById = (id: string): User | undefined => {
  if (!isClient) return undefined

  const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
  return registeredUsers.find((user: any) => user.id === id)
}

// Tạo người dùng mới
export const createUser = async (name: string, email: string, password: string): Promise<User> => {
  if (!isClient) throw new Error("Cannot create user in server environment")

  const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")

  // Kiểm tra xem email đã tồn tại chưa
  if (registeredUsers.some((user: any) => user.email === email)) {
    throw new Error("Email already exists")
  }

  // Tạo người dùng mới
  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password,
  }

  // Thêm người dùng vào database
  registeredUsers.push(newUser)
  localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers))

  return newUser
}

// Cập nhật thông tin người dùng
export const updateUser = (user: any): void => {
  if (!isClient) return

  const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
  const index = registeredUsers.findIndex((u: any) => u.id === user.id)

  if (index !== -1) {
    registeredUsers[index] = user
    localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers))
  } else {
    throw new Error("User not found")
  }
}

// Tạo OTP cho người dùng
export const createOTP = (email: string): { otp: string; expiry: number } | null => {
  if (!isClient) return null

  const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
  const userIndex = registeredUsers.findIndex((u: any) => u.email === email)

  if (userIndex === -1) {
    return null
  }

  // Tạo OTP 6 chữ số
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const expiry = Date.now() + 600000 // 10 phút

  // Cập nhật thông tin người dùng
  registeredUsers[userIndex].otp = otp
  registeredUsers[userIndex].otpExpiry = expiry

  // Lưu lại vào localStorage
  localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers))

  return { otp, expiry }
}

// Xác thực OTP
export const verifyOTP = (email: string, otp: string): boolean => {
  if (!isClient) return false

  const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
  const user = registeredUsers.find((u: any) => u.email === email)

  if (!user) return false

  // Kiểm tra OTP và thời hạn
  if (user.otp === otp && user.otpExpiry && user.otpExpiry > Date.now()) {
    return true
  }

  return false
}

// Đặt lại mật khẩu cho người dùng
export const resetPassword = async (email: string, otp: string, newPassword: string): Promise<boolean> => {
  if (!isClient) return false

  const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
  const userIndex = registeredUsers.findIndex((u: any) => u.email === email)

  if (userIndex === -1) return false

  const user = registeredUsers[userIndex]

  // Kiểm tra OTP và thời hạn
  if (user.otp !== otp || !user.otpExpiry || user.otpExpiry <= Date.now()) {
    return false
  }

  // Cập nhật mật khẩu
  user.password = newPassword
  user.otp = undefined
  user.otpExpiry = undefined

  // Lưu lại vào localStorage
  registeredUsers[userIndex] = user
  localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers))

  return true
}

// Xác thực người dùng
export const authenticateUser = async (email: string, password: string): Promise<User | null> => {
  if (!isClient) return null

  const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
  const user = registeredUsers.find((u: any) => u.email === email && u.password === password)

  if (!user) {
    return null
  }

  return user
}

// Trong môi trường server (isClient = false), trả về dữ liệu giả lập:
const serverDatabase: Database = {
  users: [
    {
      id: "1747250452107",
      name: "Lê Văn Công",
      email: "levancong9b1819@gmail.com",
      password: "123456789"
    }
  ]
}

