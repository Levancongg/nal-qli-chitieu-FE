"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import ExpenseForm from "@/components/expense-form"
import type { DayPicker } from "react-day-picker"

export default function CalendarPage() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedDayExpenses, setSelectedDayExpenses] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [expensesByDate, setExpensesByDate] = useState<{ [key: string]: any[] }>({})

  useEffect(() => {
    setIsClient(true)
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    if (!isLoggedIn) {
      router.push("/login")
    }
  }, [router])

  useEffect(() => {
    // Load user expenses from localStorage
    const expensesJSON = localStorage.getItem("userExpenses")
    if (expensesJSON) {
      const loadedExpenses = JSON.parse(expensesJSON)
      setExpenses(loadedExpenses)

      // Group expenses by date
      const byDate: { [key: string]: any[] } = {}
      loadedExpenses.forEach((expense: any) => {
        const dateStr = new Date(expense.date).toDateString()
        if (!byDate[dateStr]) {
          byDate[dateStr] = []
        }
        byDate[dateStr].push(expense)
      })

      setExpensesByDate(byDate)
    }
  }, [showExpenseForm]) // Re-run when form closes to refresh data

  useEffect(() => {
    if (date) {
      // Filter expenses for the selected date
      const dateStr = date.toDateString()
      setSelectedDayExpenses(expensesByDate[dateStr] || [])
    }
  }, [date, expensesByDate])

  if (!isClient) {
    return null // Prevent hydration errors
  }

  // Function to check if a date has expenses
  const hasExpenseOnDay = (day: Date) => {
    return !!expensesByDate[day.toDateString()]
  }

  // Function to get total amount for a day
  const getDayTotal = (day: Date) => {
    const dateExpenses = expensesByDate[day.toDateString()] || []
    return dateExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  }

  // Get current month's total
  const getCurrentMonthTotal = () => {
    const currentMonth = date ? date.getMonth() : new Date().getMonth()
    const currentYear = date ? date.getFullYear() : new Date().getFullYear()

    return expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.date)
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
      })
      .reduce((sum, expense) => sum + expense.amount, 0)
  }

  const currentDate = date || new Date()

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8 pt-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Lịch chi tiêu
        </h2>
        <Badge variant="outline" className="text-lg px-4 py-2 border-primary/20 hover:bg-primary/5 transition-colors">
          Tổng chi tiêu tháng: {getCurrentMonthTotal().toLocaleString()}đ
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="border-b bg-muted/50">
            <CardTitle className="text-xl">
              Lịch tháng {currentDate.getMonth() + 1}/{currentDate.getFullYear()}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border shadow-sm"
              modifiers={{
                hasExpense: (date: Date) => hasExpenseOnDay(date),
              }}
              modifiersStyles={{
                hasExpense: {
                  fontWeight: "bold",
                  backgroundColor: "rgba(var(--primary), 0.1)",
                  color: "hsl(var(--primary))",
                },
              }}
            />
          </CardContent>
        </Card>

        <Card className="col-span-1 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="border-b bg-muted/50">
            <CardTitle className="text-xl">
              Chi tiết ngày {currentDate.toLocaleDateString("vi-VN")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {selectedDayExpenses.length > 0 ? (
              <div className="space-y-4">
                {selectedDayExpenses.map((expense) => (
                  <div 
                    key={expense.id} 
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="font-medium flex items-center gap-2">
                        {expense.description || "Không có mô tả"}
                        <Badge 
                          variant={expense.type === "income" ? "success" : "destructive"}
                          className="text-xs"
                        >
                          {expense.type === "income" ? "Thu nhập" : "Chi tiêu"}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">{expense.category}</div>
                    </div>
                    <div className={`font-medium ${expense.type === "income" ? "text-emerald-600" : "text-red-600"}`}>
                      {expense.type === "income" ? "+" : "-"}
                      {expense.amount.toLocaleString()} ₫
                    </div>
                  </div>
                ))}

                <div className="pt-4 space-y-3 bg-muted/30 p-4 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Tổng thu trong ngày:</span>
                    <span className="font-medium text-emerald-600">
                      {selectedDayExpenses
                        .filter((exp) => exp.type === "income")
                        .reduce((sum, exp) => sum + exp.amount, 0)
                        .toLocaleString()}{" "}
                      ₫
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Tổng chi trong ngày:</span>
                    <span className="font-medium text-red-600">
                      {selectedDayExpenses
                        .filter((exp) => exp.type === "expense")
                        .reduce((sum, exp) => sum + exp.amount, 0)
                        .toLocaleString()}{" "}
                      ₫
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground bg-muted/30 rounded-lg">
                Không có giao dịch nào vào ngày này
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="border-b bg-muted/50">
          <CardTitle className="text-xl">Tổng quan tháng {currentDate.getMonth() + 1}</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="text-sm text-muted-foreground mb-2">Tổng thu nhập</div>
                <div className="text-2xl font-bold text-emerald-600">
                  {expenses
                    .filter((expense) => {
                      const expenseDate = new Date(expense.date)
                      return (
                        expenseDate.getMonth() === currentDate.getMonth() &&
                        expenseDate.getFullYear() === currentDate.getFullYear() &&
                        expense.type === "income"
                      )
                    })
                    .reduce((sum, expense) => sum + expense.amount, 0)
                    .toLocaleString()}{" "}
                  ₫
                </div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="text-sm text-muted-foreground mb-2">Tổng chi tiêu</div>
                <div className="text-2xl font-bold text-red-600">
                  {expenses
                    .filter((expense) => {
                      const expenseDate = new Date(expense.date)
                      return (
                        expenseDate.getMonth() === currentDate.getMonth() &&
                        expenseDate.getFullYear() === currentDate.getFullYear() &&
                        expense.type === "expense"
                      )
                    })
                    .reduce((sum, expense) => sum + expense.amount, 0)
                    .toLocaleString()}{" "}
                  ₫
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="text-sm text-muted-foreground mb-2">Số giao dịch</div>
                <div className="text-2xl font-bold text-blue-600">
                  {
                    expenses.filter((expense) => {
                      const expenseDate = new Date(expense.date)
                      return (
                        expenseDate.getMonth() === currentDate.getMonth() &&
                        expenseDate.getFullYear() === currentDate.getFullYear()
                      )
                    }).length
                  }
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {showExpenseForm && <ExpenseForm onClose={() => setShowExpenseForm(false)} />}
    </div>
  )
}
