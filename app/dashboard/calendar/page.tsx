"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import ExpenseForm from "@/components/expense-form"

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

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Lịch chi tiêu</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>
              Lịch tháng {date?.getMonth() + 1}/{date?.getFullYear()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              modifiers={{
                hasExpense: (date) => hasExpenseOnDay(date),
              }}
              modifiersStyles={{
                hasExpense: {
                  fontWeight: "bold",
                  backgroundColor: "rgba(var(--primary), 0.1)",
                  color: "hsl(var(--primary))",
                },
              }}
              components={{
                DayContent: (props) => (
                  <div className="relative h-9 w-9 p-0 flex items-center justify-center">
                    <span>{props.day.day}</span>
                    {hasExpenseOnDay(props.day.date) && (
                      <div className="absolute bottom-1 left-0 right-0 flex justify-center">
                        <div className="h-1 w-1 rounded-full bg-primary"></div>
                      </div>
                    )}
                  </div>
                ),
              }}
            />
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>
              Chi tiết ngày {date?.getDate()}/{date?.getMonth() + 1}/{date?.getFullYear()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDayExpenses.length > 0 ? (
              <div className="space-y-4">
                {selectedDayExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {expense.description || "Không có mô tả"}
                        <Badge variant={expense.type === "income" ? "success" : "destructive"}>
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

                {/* Daily totals section */}
                <div className="pt-4 space-y-2">
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
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                Không có giao dịch nào vào ngày này
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tổng quan tháng {date?.getMonth() + 1}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Tổng thu nhập</div>
                <div className="text-2xl font-bold text-emerald-600">
                  {expenses
                    .filter((expense) => {
                      const expenseDate = new Date(expense.date)
                      return (
                        expenseDate.getMonth() === (date?.getMonth() || new Date().getMonth()) &&
                        expenseDate.getFullYear() === (date?.getFullYear() || new Date().getFullYear()) &&
                        expense.type === "income"
                      )
                    })
                    .reduce((sum, expense) => sum + expense.amount, 0)
                    .toLocaleString()}{" "}
                  ₫
                </div>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Tổng chi tiêu</div>
                <div className="text-2xl font-bold text-red-600">
                  {expenses
                    .filter((expense) => {
                      const expenseDate = new Date(expense.date)
                      return (
                        expenseDate.getMonth() === (date?.getMonth() || new Date().getMonth()) &&
                        expenseDate.getFullYear() === (date?.getFullYear() || new Date().getFullYear()) &&
                        expense.type === "expense"
                      )
                    })
                    .reduce((sum, expense) => sum + expense.amount, 0)
                    .toLocaleString()}{" "}
                  ₫
                </div>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Số giao dịch</div>
                <div className="text-2xl font-bold">
                  {
                    expenses.filter((expense) => {
                      const expenseDate = new Date(expense.date)
                      return (
                        expenseDate.getMonth() === (date?.getMonth() || new Date().getMonth()) &&
                        expenseDate.getFullYear() === (date?.getFullYear() || new Date().getFullYear())
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
