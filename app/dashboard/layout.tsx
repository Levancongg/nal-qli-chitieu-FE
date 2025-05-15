"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BarChart3, Calendar, CreditCard, Home, LogOut, Menu, PieChart, Settings, User, Wallet, X } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [userName, setUserName] = useState("")

  useEffect(() => {
    setIsClient(true)

    // Kiểm tra nếu người dùng đã đăng nhập
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    if (isLoggedIn !== "true") {
      router.push("/login")
      return
    }

    // Lấy thông tin người dùng
    try {
      const userDataStr = localStorage.getItem("currentUser")
      if (userDataStr) {
        const userData = JSON.parse(userDataStr)
        setUserName(userData.name || "Người dùng")
      } else {
        router.push("/login")
      }
    } catch (error) {
      console.error("Error getting user data:", error)
      router.push("/login")
    }
  }, [router])

  const handleLogout = () => {
    // Xóa thông tin người dùng
    localStorage.removeItem("currentUser")
    localStorage.removeItem("isLoggedIn")
    router.push("/login")
  }

  const navigation = [
    { name: "Tổng quan", href: "/dashboard", icon: Home },
    { name: "Giao dịch", href: "/dashboard/transactions", icon: CreditCard },
    { name: "Lịch", href: "/dashboard/calendar", icon: Calendar },
    { name: "Báo cáo", href: "/dashboard/reports", icon: BarChart3 },
    { name: "Ngân sách", href: "/dashboard/budget", icon: PieChart },
    { name: "Khoản đi vay", href: "/dashboard/loans", icon: LogOut },
    { name: "Khoản cho vay", href: "/dashboard/lending", icon: LogOut },
    { name: "Khoản tiết kiệm", href: "/dashboard/savings", icon: Wallet },
    { name: "Cài đặt", href: "/dashboard/settings", icon: Settings },
  ]

  if (!isClient) {
    return null // Prevent hydration errors
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col">
            <div className="flex items-center gap-2 border-b pb-4">
              <Wallet className="h-6 w-6" />
              <span className="text-lg font-semibold">Quản Lý Chi Tiêu Cá Nhân</span>
              <Button variant="ghost" size="icon" className="ml-auto">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="py-2 text-sm text-muted-foreground">Xin chào, {userName}</div>
            <nav className="flex-1 overflow-auto py-4">
              <div className="grid gap-1">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent ${
                      pathname === item.href ? "bg-accent" : ""
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                ))}
              </div>
            </nav>
            <div className="border-t pt-4">
              <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </Button>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <Wallet className="h-6 w-6" />
          <span className="text-lg font-semibold">Quản Lý Chi Tiêu Cá Nhân</span>
        </div>
        <div className="flex-1 flex items-center justify-end">
          <div className="hidden md:flex items-center gap-2 mr-2">
            <span className="text-sm font-medium">Xin chào, {userName}</span>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
            <span className="sr-only">Tài khoản</span>
          </Button>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="fixed left-0 top-16 bottom-0 w-64 border-r bg-background overflow-y-auto z-10 hidden md:block">
          <div className="flex h-full flex-col gap-2 p-4">
            <nav className="grid gap-1 py-4">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent ${
                    pathname === item.href ? "bg-accent" : ""
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="mt-auto">
              <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </Button>
            </div>
          </div>
        </aside>
        <main className="flex-1 md:ml-64">{children}</main>
      </div>
    </div>
  )
}
