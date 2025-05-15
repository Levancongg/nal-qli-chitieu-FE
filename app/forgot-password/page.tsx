"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, Mail, KeyRound, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [email, setEmail] = useState("")
  const [showVerificationForm, setShowVerificationForm] = useState(false)
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [resendDisabled, setResendDisabled] = useState(false)
  const [countdown, setCountdown] = useState(0)

  async function handleSendOTP(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Đã xảy ra lỗi. Vui lòng thử lại.")
        setIsLoading(false)
        return
      }

      // Hiển thị thông báo thành công
      setSuccess(data.message || "Mã OTP đã được gửi đến email của bạn.")

      // Trong môi trường phát triển, hiển thị OTP để dễ kiểm thử
      if (data.otp) {
        setSuccess(`Mã OTP đã được gửi đến email của bạn. (Mã OTP: ${data.otp})`)
      }

      setShowVerificationForm(true)
      setOtpSent(true)

      // Thiết lập thời gian chờ để gửi lại OTP (60 giây)
      setResendDisabled(true)
      setCountdown(60)

      const timer = setInterval(() => {
        setCountdown((prevCount) => {
          if (prevCount <= 1) {
            clearInterval(timer)
            setResendDisabled(false)
            return 0
          }
          return prevCount - 1
        })
      }, 1000)
    } catch (err) {
      setError("Đã xảy ra lỗi. Vui lòng thử lại sau.")
    }

    setIsLoading(false)
  }

  async function handleResetPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu không khớp. Vui lòng kiểm tra lại.")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
          password: newPassword,
          confirmPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Đặt lại mật khẩu thất bại. Vui lòng thử lại.")
        setIsLoading(false)
        return
      }

      // Đặt lại mật khẩu thành công
      setSuccess("Mật khẩu đã được đặt lại thành công. Bạn có thể đăng nhập với mật khẩu mới.")

      // Chuyển hướng đến trang đăng nhập sau 3 giây
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (err) {
      setError("Đặt lại mật khẩu thất bại. Vui lòng thử lại sau.")
    }

    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <Wallet className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Quên mật khẩu</CardTitle>
          <CardDescription className="text-center">
            {!showVerificationForm ? "Nhập email của bạn để nhận mã OTP" : "Nhập mã OTP và mật khẩu mới của bạn"}
          </CardDescription>
        </CardHeader>

        {!showVerificationForm ? (
          <form onSubmit={handleSendOTP}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  "Gửi mã OTP"
                )}
              </Button>
              <div className="text-center text-sm">
                <Link href="/login" className="text-primary hover:underline">
                  Quay lại đăng nhập
                </Link>
              </div>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="otp">Mã OTP</Label>
                  {otpSent && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs"
                      disabled={resendDisabled}
                      onClick={(e) => {
                        e.preventDefault()
                        handleSendOTP(e as any)
                      }}
                    >
                      {resendDisabled ? `Gửi lại sau (${countdown}s)` : "Gửi lại mã"}
                    </Button>
                  )}
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="otp"
                    name="otp"
                    placeholder="Nhập mã 6 chữ số"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Đặt lại mật khẩu"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setShowVerificationForm(false)
                  setOtp("")
                  setNewPassword("")
                  setConfirmPassword("")
                  setError("")
                  setSuccess("")
                }}
              >
                Quay lại
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  )
}
