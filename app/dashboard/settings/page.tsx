"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Bell, Lock, Save } from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string; phone?: string; currency?: string } | null>(null)

  useEffect(() => {
    setIsClient(true)
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    if (!isLoggedIn) {
      router.push("/login")
    } else {
      // Get user data
      const userData = localStorage.getItem("currentUser")
      if (userData) {
        setUser(JSON.parse(userData))
      }
    }
  }, [router])

  if (!isClient || !user) {
    return null // Prevent hydration errors
  }

  const handleProfileUpdate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const phone = (formData.get("phone") as string) || ""
    const currency = (formData.get("currency") as string) || "VND"

    // Get all registered users
    const usersJSON = localStorage.getItem("registeredUsers")
    const users = usersJSON ? JSON.parse(usersJSON) : []

    // Find and update the current user in the registered users list
    const updatedUsers = users.map((u: any) => {
      if (u.email === user.email) {
        return { ...u, name, email, phone, currency }
      }
      return u
    })

    // Update registeredUsers in localStorage
    localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers))

    // Update current user data
    const updatedUser = { name, email, phone, currency }
    localStorage.setItem("currentUser", JSON.stringify(updatedUser))
    setUser(updatedUser)

    // Show success message
    alert("Thông tin cá nhân đã được cập nhật!")
  }

  // Thay đổi hàm handlePasswordUpdate để cập nhật mật khẩu
  const handlePasswordUpdate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const currentPassword = formData.get("currentPassword") as string
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    // Kiểm tra mật khẩu mới và xác nhận mật khẩu
    if (newPassword !== confirmPassword) {
      alert("Mật khẩu mới và xác nhận mật khẩu không khớp!")
      return
    }

    // Lấy danh sách người dùng
    const usersJSON = localStorage.getItem("registeredUsers")
    if (!usersJSON) {
      alert("Không thể cập nhật mật khẩu. Vui lòng thử lại sau.")
      return
    }

    const users = JSON.parse(usersJSON)
    const currentUserJSON = localStorage.getItem("currentUser")
    if (!currentUserJSON) {
      alert("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.")
      return
    }

    const currentUser = JSON.parse(currentUserJSON)

    // Tìm người dùng trong danh sách
    const userIndex = users.findIndex((u: any) => u.email === currentUser.email)
    if (userIndex === -1) {
      alert("Không tìm thấy tài khoản. Vui lòng đăng nhập lại.")
      return
    }

    // Kiểm tra mật khẩu hiện tại
    if (users[userIndex].password !== currentPassword) {
      alert("Mật khẩu hiện tại không chính xác!")
      return
    }

    // Cập nhật mật khẩu
    users[userIndex].password = newPassword
    localStorage.setItem("registeredUsers", JSON.stringify(users))

    alert("Mật khẩu đã được cập nhật thành công!")
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Cài đặt</h2>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
          <TabsTrigger value="security">Bảo mật</TabsTrigger>
          <TabsTrigger value="notifications">Thông báo</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>Cập nhật thông tin cá nhân của bạn</CardDescription>
            </CardHeader>
            <form onSubmit={handleProfileUpdate}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Họ và tên</Label>
                  <Input id="name" name="name" defaultValue={user.name} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" defaultValue={user.email} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="Nhập số điện thoại của bạn"
                    defaultValue={user.phone || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Đơn vị tiền tệ</Label>
                  <Select defaultValue={user.currency || "VND"} name="currency">
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn đơn vị tiền tệ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VND">VND - Việt Nam Đồng</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="gap-2">
                  <Save className="h-4 w-4" /> Lưu thay đổi
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Đổi mật khẩu</CardTitle>
              <CardDescription>Cập nhật mật khẩu của bạn</CardDescription>
            </CardHeader>
            <form onSubmit={handlePasswordUpdate}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
                  <Input id="current-password" name="currentPassword" type="password" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Mật khẩu mới</Label>
                  <Input id="new-password" name="newPassword" type="password" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
                  <Input id="confirm-password" name="confirmPassword" type="password" required />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="gap-2">
                  <Lock className="h-4 w-4" /> Cập nhật mật khẩu
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bảo mật tài khoản</CardTitle>
              <CardDescription>Quản lý các tùy chọn bảo mật cho tài khoản của bạn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Xác thực hai yếu tố</div>
                  <div className="text-sm text-muted-foreground">Thêm một lớp bảo mật cho tài khoản của bạn</div>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Thông báo đăng nhập</div>
                  <div className="text-sm text-muted-foreground">
                    Nhận thông báo khi có đăng nhập mới vào tài khoản của bạn
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt thông báo</CardTitle>
              <CardDescription>Quản lý cách bạn nhận thông báo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Thông báo vượt ngân sách</div>
                  <div className="text-sm text-muted-foreground">Nhận thông báo khi chi tiêu vượt quá ngân sách</div>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Thông báo giao dịch mới</div>
                  <div className="text-sm text-muted-foreground">Nhận thông báo khi có giao dịch mới được thêm vào</div>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Báo cáo hàng tháng</div>
                  <div className="text-sm text-muted-foreground">
                    Nhận báo cáo tổng hợp chi tiêu hàng tháng qua email
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Mẹo tiết kiệm</div>
                  <div className="text-sm text-muted-foreground">Nhận các mẹo tiết kiệm dựa trên chi tiêu của bạn</div>
                </div>
                <Switch />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="gap-2">
                <Bell className="h-4 w-4" /> Lưu cài đặt thông báo
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
