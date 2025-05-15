"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit2, Plus, Save, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function BudgetPage() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [showBudgetForm, setShowBudgetForm] = useState(false)
  const [budgets, setBudgets] = useState<any[]>([])
  const [editingBudget, setEditingBudget] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [categorySpending, setCategorySpending] = useState<{ [key: string]: number }>({})
  const [totalBudget, setTotalBudget] = useState(0)
  const [totalSpent, setTotalSpent] = useState(0)

  useEffect(() => {
    setIsClient(true)
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    if (!isLoggedIn) {
      router.push("/login")
    }
  }, [router])

  useEffect(() => {
    // Load budgets from localStorage
    const budgetsJSON = localStorage.getItem("userBudgets")
    if (budgetsJSON) {
      const loadedBudgets = JSON.parse(budgetsJSON)
      setBudgets(loadedBudgets)

      // Calculate total budget
      const total = loadedBudgets.reduce((sum: number, budget: any) => sum + budget.amount, 0)
      setTotalBudget(total)
    }

    // Load transactions from localStorage
    const transactionsJSON = localStorage.getItem("userExpenses")
    if (transactionsJSON) {
      const loadedTransactions = JSON.parse(transactionsJSON)

      // Only consider expense transactions
      const expenses = loadedTransactions.filter((t: any) => t.type === "expense")
      setTransactions(expenses)

      // Calculate spending by category
      const spending: { [key: string]: number } = {}
      let total = 0

      // Get current month expenses
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()

      expenses.forEach((expense: any) => {
        const expenseDate = new Date(expense.date)
        if (expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear) {
          if (!spending[expense.category]) {
            spending[expense.category] = 0
          }
          spending[expense.category] += expense.amount
          total += expense.amount
        }
      })

      setCategorySpending(spending)
      setTotalSpent(total)
    }
  }, [showBudgetForm]) // Re-run when form closes to refresh data

  if (!isClient) {
    return null // Prevent hydration errors
  }

  const remainingBudget = totalBudget - totalSpent

  const handleAddBudget = (formData: FormData) => {
    const category = formData.get("category") as string
    const amount = Number(formData.get("amount"))

    // Create budget object
    const budget = {
      id: editingBudget ? editingBudget.id : Date.now(),
      category,
      amount,
    }

    let updatedBudgets

    if (editingBudget) {
      // Update existing budget
      updatedBudgets = budgets.map((b) => (b.id === editingBudget.id ? budget : b))
    } else {
      // Check if category already has a budget
      const existingBudget = budgets.find((b) => b.category === category)

      if (existingBudget) {
        alert(`Danh mục ${category} đã có ngân sách. Vui lòng chỉnh sửa ngân sách hiện có hoặc chọn danh mục khác.`)
        return
      }

      // Add new budget
      updatedBudgets = [...budgets, budget]
    }

    // Save to localStorage
    localStorage.setItem("userBudgets", JSON.stringify(updatedBudgets))

    // Update state
    setBudgets(updatedBudgets)
    setTotalBudget(updatedBudgets.reduce((sum, b) => sum + b.amount, 0))

    // Close form and reset editing state
    setShowBudgetForm(false)
    setEditingBudget(null)
  }

  const handleDeleteBudget = (id: number) => {
    const updatedBudgets = budgets.filter((budget) => budget.id !== id)

    // Save to localStorage
    localStorage.setItem("userBudgets", JSON.stringify(updatedBudgets))

    // Update state
    setBudgets(updatedBudgets)
    setTotalBudget(updatedBudgets.reduce((sum, b) => sum + b.amount, 0))
  }

  const handleEditBudget = (budget: any) => {
    setEditingBudget(budget)
    setShowBudgetForm(true)
  }

  // Get available categories from transactions
  const availableCategories = Array.from(
    new Set(transactions.filter((t) => t.type === "expense").map((t) => t.category)),
  )

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Ngân sách</h2>
        <Button onClick={() => setShowBudgetForm(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Thêm ngân sách
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="categories">Theo danh mục</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tổng ngân sách</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalBudget.toLocaleString()} ₫</div>
                <p className="text-xs text-muted-foreground">
                  Cho tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Đã chi tiêu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSpent.toLocaleString()} ₫</div>
                <p className="text-xs text-muted-foreground">
                  {totalBudget > 0
                    ? `${Math.round((totalSpent / totalBudget) * 100)}% ngân sách`
                    : "Chưa thiết lập ngân sách"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Còn lại</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${remainingBudget >= 0 ? "" : "text-red-600"}`}>
                  {remainingBudget.toLocaleString()} ₫
                </div>
                <p className="text-xs text-muted-foreground">
                  {totalBudget > 0
                    ? `${Math.round((remainingBudget / totalBudget) * 100)}% ngân sách`
                    : "Chưa thiết lập ngân sách"}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tiến độ ngân sách</CardTitle>
              <CardDescription>
                Tổng ngân sách là tổng số tiền đã phân bổ cho các danh mục chi tiêu. Tiến độ ngân sách thể hiện tỷ lệ
                chi tiêu của bạn so với ngân sách đã thiết lập trong tháng hiện tại.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Tổng tiến độ</div>
                  <div className="text-sm font-medium">
                    {totalBudget > 0 ? `${Math.round((totalSpent / totalBudget) * 100)}%` : "N/A"}
                  </div>
                </div>
                <div className="h-4 rounded-full bg-muted">
                  {totalBudget > 0 && (
                    <div
                      className={`h-full rounded-full ${totalSpent / totalBudget > 0.9 ? "bg-red-500" : "bg-primary"}`}
                      style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
                    ></div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ngân sách theo danh mục</CardTitle>
              <CardDescription>Chi tiết ngân sách và chi tiêu theo từng danh mục</CardDescription>
            </CardHeader>
            <CardContent>
              {budgets.length > 0 ? (
                <div className="space-y-6">
                  {budgets.map((budget) => {
                    const spent = categorySpending[budget.category] || 0
                    const percentage = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0

                    return (
                      <div key={budget.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium">{budget.category}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium">
                              {spent.toLocaleString()} ₫ / {budget.amount.toLocaleString()} ₫
                            </div>
                            <div className="text-xs text-muted-foreground">{percentage}%</div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEditBudget(budget)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500"
                              onClick={() => handleDeleteBudget(budget.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="h-2 rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full ${
                              percentage > 90 ? "bg-red-500" : percentage > 75 ? "bg-yellow-500" : "bg-primary"
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                  Bạn chưa thiết lập ngân sách nào. Hãy thêm ngân sách đầu tiên của bạn!
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Budget Form Dialog */}
      <Dialog open={showBudgetForm} onOpenChange={setShowBudgetForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBudget ? "Chỉnh sửa ngân sách" : "Thêm ngân sách mới"}</DialogTitle>
            <DialogDescription>
              {editingBudget ? "Cập nhật thông tin ngân sách của bạn." : "Tạo ngân sách mới cho một danh mục chi tiêu."}
            </DialogDescription>
          </DialogHeader>
          <form action={handleAddBudget}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Danh mục</Label>
                {editingBudget ? (
                  <Input id="category" name="category" defaultValue={editingBudget.category} required readOnly />
                ) : (
                  <Select name="category" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCategories.length > 0 ? (
                        availableCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="Thực phẩm">Thực phẩm</SelectItem>
                          <SelectItem value="Giao thông">Giao thông</SelectItem>
                          <SelectItem value="Giải trí">Giải trí</SelectItem>
                          <SelectItem value="Hóa đơn">Hóa đơn</SelectItem>
                          <SelectItem value="Mua sắm">Mua sắm</SelectItem>
                          <SelectItem value="Sức khỏe">Sức khỏe</SelectItem>
                          <SelectItem value="Giáo dục">Giáo dục</SelectItem>
                          <SelectItem value="Nhà cửa">Nhà cửa</SelectItem>
                          <SelectItem value="Khác">Khác</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Số tiền ngân sách</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  placeholder="0"
                  defaultValue={editingBudget?.amount}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowBudgetForm(false)
                  setEditingBudget(null)
                }}
              >
                Hủy
              </Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                {editingBudget ? "Cập nhật" : "Lưu"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
