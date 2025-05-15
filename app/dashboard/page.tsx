"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, DollarSign, Plus, TrendingDown, TrendingUp } from "lucide-react"
import ExpenseForm from "@/components/expense-form"

export default function DashboardPage() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [transactions, setTransactions] = useState<any[]>([])
  const [categoryTotals, setCategoryTotals] = useState<{ [key: string]: number }>({})
  const [totalExpense, setTotalExpense] = useState(0)
  const [totalIncome, setTotalIncome] = useState(0)
  const [balance, setBalance] = useState(0)

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

      // Calculate category totals and total expense/income
      const expenseTotals: { [key: string]: number } = {}
      const incomeTotals: { [key: string]: number } = {}
      let totalExp = 0
      let totalInc = 0

      loadedTransactions.forEach((transaction: any) => {
        if (transaction.type === "expense") {
          if (!expenseTotals[transaction.category]) {
            expenseTotals[transaction.category] = 0
          }
          expenseTotals[transaction.category] += transaction.amount
          totalExp += transaction.amount
        } else {
          if (!incomeTotals[transaction.category]) {
            incomeTotals[transaction.category] = 0
          }
          incomeTotals[transaction.category] += transaction.amount
          totalInc += transaction.amount
        }
      })

      setCategoryTotals(expenseTotals)
      setTotalExpense(totalExp)
      setTotalIncome(totalInc)
      setBalance(totalInc - totalExp)
    }
  }, [showExpenseForm]) // Re-run when form closes to refresh data

  if (!isClient) {
    return null // Prevent hydration errors
  }

  // Sort transactions by date (newest first)
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4) // Get only the 4 most recent transactions

  // Calculate percentages for each expense category
  const categoryPercentages: { [key: string]: number } = {}
  Object.keys(categoryTotals).forEach((category) => {
    categoryPercentages[category] = totalExpense > 0 ? Math.round((categoryTotals[category] / totalExpense) * 100) : 0
  })

  // Find top spending category
  let topCategory = { name: "N/A", amount: 0 }
  Object.keys(categoryTotals).forEach((category) => {
    if (categoryTotals[category] > topCategory.amount) {
      topCategory = { name: category, amount: categoryTotals[category] }
    }
  })

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tổng quan</h2>
        </div>
        <Button onClick={() => setShowExpenseForm(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Thêm giao dịch
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="analytics">Phân tích</TabsTrigger>
          <TabsTrigger value="reports">Báo cáo</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng thu nhập</CardTitle>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">{totalIncome.toLocaleString()} ₫</div>
                <p className="text-xs text-muted-foreground">Tất cả thu nhập của bạn</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng chi tiêu</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{totalExpense.toLocaleString()} ₫</div>
                <p className="text-xs text-muted-foreground">Tất cả chi tiêu của bạn</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Số dư</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${balance >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {balance.toLocaleString()} ₫
                </div>
                <p className="text-xs text-muted-foreground">Thu nhập - Chi tiêu</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Số giao dịch</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{transactions.length}</div>
                <p className="text-xs text-muted-foreground">Tổng số giao dịch đã ghi nhận</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Giao dịch gần đây</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentTransactions.length > 0 ? (
                    recentTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between border-b pb-2">
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {transaction.category}
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                transaction.type === "income"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {transaction.type === "income" ? "Thu nhập" : "Chi tiêu"}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">{transaction.description}</div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString("vi-VN")}
                          </div>
                          <div
                            className={`font-medium ${transaction.type === "income" ? "text-emerald-600" : "text-red-600"}`}
                          >
                            {transaction.type === "income" ? "+" : "-"}
                            {transaction.amount.toLocaleString()} ₫
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      Chưa có giao dịch nào. Hãy thêm giao dịch đầu tiên của bạn!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Phân bổ chi tiêu</CardTitle>
                <CardDescription>Theo danh mục</CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(categoryTotals).length > 0 ? (
                  <div className="space-y-4">
                    {Object.keys(categoryTotals).map((category, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">{category}</div>
                          <div className="text-sm font-medium">{categoryPercentages[category]}%</div>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${categoryPercentages[category]}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">Chưa có dữ liệu chi tiêu để hiển thị</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Phân tích giao dịch</CardTitle>
              <CardDescription>Xem chi tiết phân tích thu nhập và chi tiêu của bạn</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Chi tiêu theo danh mục</h3>
                      <div className="space-y-4">
                        {Object.keys(categoryTotals).map((category, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span>{category}</span>
                            <span>{categoryTotals[category].toLocaleString()} ₫</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">Phân tích</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>Tổng thu nhập:</span>
                          <span className="text-emerald-600">{totalIncome.toLocaleString()} ₫</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tổng chi tiêu:</span>
                          <span className="text-red-600">{totalExpense.toLocaleString()} ₫</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Số dư:</span>
                          <span className={balance >= 0 ? "text-emerald-600" : "text-red-600"}>
                            {balance.toLocaleString()} ₫
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tỷ lệ tiết kiệm:</span>
                          <span>
                            {totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center border rounded-md">
                  <p className="text-muted-foreground">Chưa có dữ liệu giao dịch để phân tích</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Báo cáo giao dịch</CardTitle>
              <CardDescription>Xem và tải xuống báo cáo giao dịch của bạn</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Tổng quan báo cáo</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Tổng thu nhập:</span>
                          <span className="text-emerald-600">{totalIncome.toLocaleString()} ₫</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tổng chi tiêu:</span>
                          <span className="text-red-600">{totalExpense.toLocaleString()} ₫</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Số dư:</span>
                          <span className={balance >= 0 ? "text-emerald-600" : "text-red-600"}>
                            {balance.toLocaleString()} ₫
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Số giao dịch:</span>
                          <span>{transactions.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Số giao dịch thu nhập:</span>
                          <span>{transactions.filter((t) => t.type === "income").length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Số giao dịch chi tiêu:</span>
                          <span>{transactions.filter((t) => t.type === "expense").length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center border rounded-md">
                  <p className="text-muted-foreground">Chưa có dữ liệu giao dịch để tạo báo cáo</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showExpenseForm && <ExpenseForm onClose={() => setShowExpenseForm(false)} />}
    </div>
  )
}
