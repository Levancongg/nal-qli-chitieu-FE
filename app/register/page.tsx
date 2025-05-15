"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuthContext } from "@/lib/AuthContext"

export default function RegisterPage() {
  const router = useRouter()
  const { register, error: authError } = useAuthContext()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    const formData = new FormData(event.currentTarget)
    const username = formData.get("username") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp. Vui lòng kiểm tra lại.")
      setIsLoading(false)
      return
    }

    try {
      await register({ username, email, password })
      setSuccess("Đăng ký thành công! Vui lòng đăng nhập với tài khoản của bạn.")

      // Chuyển hướng đến trang đăng nhập sau 2 giây
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (err: any) {
      console.error("Registration error:", err)
      setError(err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại sau.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <Wallet className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Đăng ký tài khoản</CardTitle>
          <CardDescription className="text-center">Tạo tài khoản để bắt đầu quản lý chi tiêu của bạn</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {(error || authError) && (
              <Alert variant="destructive">
                <AlertDescription>{error || authError}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input 
                id="username" 
                name="username" 
                placeholder="Nhập tên đăng nhập" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="name@example.com" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                placeholder="Nhập mật khẩu"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <Input 
                id="confirmPassword" 
                name="confirmPassword" 
                type="password" 
                placeholder="Nhập lại mật khẩu"
                required 
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Đang đăng ký..." : "Đăng ký"}
            </Button>
            <div className="text-center text-sm">
              Đã có tài khoản?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Đăng nhập
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
