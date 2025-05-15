"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download } from "lucide-react"

export default function ReportsPage() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString())
  const [transactions, setTransactions] = useState<any[]>([])
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalExpense, setTotalExpense] = useState(0)

  useEffect(() => {
    setIsClient(true)
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    if (!isLoggedIn) {
      router.push("/login")
    }
  }, [router])

  useEffect(() => {
    // Load user transactions from localStorage
    const transactionsJSON = localStorage.getItem("userExpenses")
    if (transactionsJSON) {
      const loadedTransactions = JSON.parse(transactionsJSON)
      setTransactions(loadedTransactions)
    }
  }, [])

  useEffect(() => {
    if (transactions.length > 0) {
      processData()
    }
  }, [transactions, selectedYear, selectedMonth])

  const processData = () => {
    // Calculate monthly data
    const months = Array.from({ length: 12 }, (_, i) => i + 1)

    const monthlyDataArray = months.map((month) => {
      const monthTransactions = transactions.filter((t) => {
        const date = new Date(t.date)
        return date.getFullYear().toString() === selectedYear && date.getMonth() + 1 === month
      })

      const income = monthTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

      const expense = monthTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

      return {
        month: `Tháng ${month}`,
        income,
        expense,
        balance: income - expense,
      }
    })

    setMonthlyData(monthlyDataArray)

    // Calculate current month data
    const currentMonthTransactions = transactions.filter((t) => {
      const date = new Date(t.date)
      return date.getFullYear().toString() === selectedYear && (date.getMonth() + 1).toString() === selectedMonth
    })

    // Total income and expense for current month
    const currentMonthIncome = currentMonthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0)

    const currentMonthExpense = currentMonthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0)

    setTotalIncome(currentMonthIncome)
    setTotalExpense(currentMonthExpense)

    // Calculate category data
    const expensesByCategory: { [key: string]: number } = {}

    currentMonthTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        if (!expensesByCategory[t.category]) {
          expensesByCategory[t.category] = 0
        }
        expensesByCategory[t.category] += t.amount
      })

    const categoryDataArray = Object.keys(expensesByCategory)
      .map((category) => {
        const amount = expensesByCategory[category]
        const percentage = currentMonthExpense > 0 ? Math.round((amount / currentMonthExpense) * 100) : 0

        return {
          category,
          amount,
          percentage,
        }
      })
      .sort((a, b) => b.amount - a.amount) // Sort by amount descending

    setCategoryData(categoryDataArray)
  }

  if (!isClient) {
    return null // Prevent hydration errors
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Báo cáo</h2>
        <Button className="gap-2">
          <Download className="h-4 w-4" /> Xuất báo cáo
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="w-full md:w-[200px]">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn năm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2022">2022</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-[200px]">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn tháng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Tháng 1</SelectItem>
              <SelectItem value="2">Tháng 2</SelectItem>
              <SelectItem value="3">Tháng 3</SelectItem>
              <SelectItem value="4">Tháng 4</SelectItem>
              <SelectItem value="5">Tháng 5</SelectItem>
              <SelectItem value="6">Tháng 6</SelectItem>
              <SelectItem value="7">Tháng 7</SelectItem>
              <SelectItem value="8">Tháng 8</SelectItem>
              <SelectItem value="9">Tháng 9</SelectItem>
              <SelectItem value="10">Tháng 10</SelectItem>
              <SelectItem value="11">Tháng 11</SelectItem>
              <SelectItem value="12">Tháng 12</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="categories">Theo danh mục</TabsTrigger>
          <TabsTrigger value="trends">Xu hướng</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tổng thu nhập</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">{totalIncome.toLocaleString()} ₫</div>
                <p className="text-xs text-muted-foreground">
                  Tháng {selectedMonth}/{selectedYear}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tổng chi tiêu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{totalExpense.toLocaleString()} ₫</div>
                <p className="text-xs text-muted-foreground">
                  Tháng {selectedMonth}/{selectedYear}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Số dư</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${(totalIncome - totalExpense) >= 0 ? "text-emerald-600" : "text-red-600"}`}
                >
                  {(totalIncome - totalExpense).toLocaleString()} ₫
                </div>
                <p className="text-xs text-muted-foreground">Thu nhập - Chi tiêu</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tỷ lệ tiết kiệm</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">(Thu nhập - Chi tiêu) / Thu nhập</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Thu chi theo tháng</CardTitle>
              <CardDescription>
                Biểu đồ thu nhập và chi tiêu của bạn theo tháng trong năm {selectedYear}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {monthlyData.length > 0 ? (
                  <div className="flex h-full items-end gap-2">
                    {monthlyData.map((item, index) => (
                      <div key={index} className="flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-1 h-full justify-end">
                          {item.income > 0 && (
                            <div
                              className="bg-emerald-500 rounded-t w-full transition-all"
                              style={{
                                height: `${(item.income / Math.max(...monthlyData.map((d) => Math.max(d.income, d.expense)))) * 70}%`,
                              }}
                              title={`Thu nhập: ${item.income.toLocaleString()} ₫`}
                            ></div>
                          )}
                          {item.expense > 0 && (
                            <div
                              className="bg-red-500 rounded-t w-full transition-all"
                              style={{
                                height: `${(item.expense / Math.max(...monthlyData.map((d) => Math.max(d.income, d.expense)))) * 70}%`,
                              }}
                              title={`Chi tiêu: ${item.expense.toLocaleString()} ₫`}
                            ></div>
                          )}
                        </div>
                        <div className="text-xs text-center">{item.month}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Không có dữ liệu</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Chi tiêu theo danh mục</CardTitle>
              <CardDescription>Phân tích chi tiêu của bạn theo từng danh mục</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {categoryData.length > 0 ? (
                  <>
                    {/* Pie chart placeholder */}
                    <div className="flex justify-center">
                      <div className="relative h-60 w-60 rounded-full bg-muted flex items-center justify-center">
                        <div className="absolute inset-4 rounded-full bg-background flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-2xl font-bold">{totalExpense.toLocaleString()} ₫</div>
                            <div className="text-xs text-muted-foreground">Tổng chi tiêu</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {categoryData.map((category, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{
                                  backgroundColor: `hsl(${index * 60}, 70%, 50%)`,
                                }}
                              ></div>
                              <div className="text-sm font-medium">{category.category}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium">{category.amount.toLocaleString()} ₫</div>
                              <div className="text-xs text-muted-foreground">{category.percentage}%</div>
                            </div>
                          </div>
                          <div className="h-2 rounded-full bg-muted">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${category.percentage}%`,
                                backgroundColor: `hsl(${index * 60}, 70%, 50%)`,
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="text-muted-foreground">Không có dữ liệu chi tiêu trong tháng này</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Xu hướng chi tiêu</CardTitle>
              <CardDescription>Phân tích xu hướng chi tiêu theo thời gian</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {monthlyData.length > 0 ? (
                  <>
                    <div className="h-[300px] border rounded-md p-4">
                      <div className="h-full flex items-end">
                        <div className="w-full h-full flex flex-col justify-between">
                          <div className="border-b border-dashed border-muted-foreground/20 relative h-0">
                            <span className="absolute -top-3 -left-12 text-xs text-muted-foreground">
                              {Math.max(...monthlyData.map((d) => Math.max(d.income, d.expense))).toLocaleString()} ₫
                            </span>
                          </div>
                          <div className="border-b border-dashed border-muted-foreground/20 relative h-0">
                            <span className="absolute -top-3 -left-12 text-xs text-muted-foreground">
                              {Math.round(
                                Math.max(...monthlyData.map((d) => Math.max(d.income, d.expense))) * 0.75,
                              ).toLocaleString()}{" "}
                              ₫
                            </span>
                          </div>
                          <div className="border-b border-dashed border-muted-foreground/20 relative h-0">
                            <span className="absolute -top-3 -left-12 text-xs text-muted-foreground">
                              {Math.round(
                                Math.max(...monthlyData.map((d) => Math.max(d.income, d.expense))) * 0.5,
                              ).toLocaleString()}{" "}
                              ₫
                            </span>
                          </div>
                          <div className="border-b border-dashed border-muted-foreground/20 relative h-0">
                            <span className="absolute -top-3 -left-12 text-xs text-muted-foreground">
                              {Math.round(
                                Math.max(...monthlyData.map((d) => Math.max(d.income, d.expense))) * 0.25,
                              ).toLocaleString()}{" "}
                              ₫
                            </span>
                          </div>
                          <div className="border-b border-muted-foreground/20 relative h-0">
                            <span className="absolute -top-3 -left-12 text-xs text-muted-foreground">0 ₫</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Nhận xét</h3>
                      <div className="space-y-2">
                        <p className="text-sm">
                          {totalIncome > totalExpense
                            ? `Thu nhập của bạn trong tháng ${selectedMonth} năm ${selectedYear} cao hơn chi tiêu ${(totalIncome - totalExpense).toLocaleString()} ₫, đây là một dấu hiệu tốt.`
                            : `Chi tiêu của bạn trong tháng ${selectedMonth} năm ${selectedYear} cao hơn thu nhập ${(totalExpense - totalIncome).toLocaleString()} ₫. Bạn nên xem xét giảm chi tiêu hoặc tăng thu nhập.`}
                        </p>
                        {categoryData.length > 0 && (
                          <p className="text-sm">
                            Danh mục <span className="font-medium">{categoryData[0].category}</span> chiếm tỷ trọng lớn
                            nhất trong chi tiêu của bạn ({categoryData[0].percentage}%).
                            {categoryData[0].percentage > 30
                              ? " Bạn có thể xem xét cắt giảm chi tiêu cho danh mục này."
                              : ""}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="text-muted-foreground">Không có đủ dữ liệu để phân tích xu hướng</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
