import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart3, DollarSign, PieChart, Wallet } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6 mx-auto">
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            <span className="text-xl font-bold">Quản Lý Chi Tiêu Cá Nhân</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Đăng nhập
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Đăng ký</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Quản lý chi tiêu cá nhân dễ dàng
                </h1>
                <p className="text-muted-foreground md:text-xl">
                  Theo dõi, phân tích và tối ưu hóa chi tiêu của bạn. Đạt được mục tiêu tài chính với công cụ quản lý
                  chi tiêu thông minh.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/register">
                    <Button size="lg" className="gap-2">
                      Bắt đầu ngay
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2 p-6 border rounded-lg shadow-sm">
                  <DollarSign className="h-10 w-10 text-primary" />
                  <h3 className="text-xl font-bold">Theo dõi chi tiêu</h3>
                  <p className="text-muted-foreground">
                    Ghi lại và phân loại mọi khoản chi tiêu của bạn một cách dễ dàng.
                  </p>
                </div>
                <div className="flex flex-col gap-2 p-6 border rounded-lg shadow-sm">
                  <BarChart3 className="h-10 w-10 text-primary" />
                  <h3 className="text-xl font-bold">Báo cáo chi tiết</h3>
                  <p className="text-muted-foreground">Xem báo cáo trực quan về chi tiêu theo thời gian và danh mục.</p>
                </div>
                <div className="flex flex-col gap-2 p-6 border rounded-lg shadow-sm">
                  <PieChart className="h-10 w-10 text-primary" />
                  <h3 className="text-xl font-bold">Phân tích xu hướng</h3>
                  <p className="text-muted-foreground">Hiểu rõ xu hướng chi tiêu và tìm cơ hội tiết kiệm.</p>
                </div>
                <div className="flex flex-col gap-2 p-6 border rounded-lg shadow-sm">
                  <Wallet className="h-10 w-10 text-primary" />
                  <h3 className="text-xl font-bold">Quản lý ngân sách</h3>
                  <p className="text-muted-foreground">Thiết lập ngân sách và nhận thông báo khi vượt quá giới hạn.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
