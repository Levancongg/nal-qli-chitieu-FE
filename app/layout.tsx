import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/lib/AuthContext"

export const metadata: Metadata = {
  title: "Quản Lý Chi Tiêu Cá Nhân",
  description: "Ứng dụng quản lý chi tiêu cá nhân",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
