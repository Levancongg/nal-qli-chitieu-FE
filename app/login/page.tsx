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
import Cookies from 'js-cookie'

export default function LoginPage() {
  const router = useRouter()
  const { login, error: authError } = useAuthContext()
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
    const password = formData.get("password") as string
  
    try {
      const response = await login(username, password)
      console.log(response, "response")

      // Lưu access token vào cookie
      if (response.accessToken) {
        Cookies.set('authToken', response.accessToken, {
          expires: 7, // Hết hạn sau 7 ngày
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        })
      }

      setSuccess("Đăng nhập thành công!")
      
      // Chuyển hướng đến dashboard sau khi đăng nhập thành công
      router.push("/dashboard")
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại sau.")
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
          <CardTitle className="text-2xl font-bold text-center">Đăng nhập</CardTitle>
          <CardDescription className="text-center">Nhập thông tin đăng nhập của bạn để tiếp tục</CardDescription>
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
                type="text" 
                placeholder="Nhập tên đăng nhập" 
                required 
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật khẩu</Label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                placeholder="Nhập mật khẩu"
                required 
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
            <div className="text-center text-sm">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Đăng ký
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
