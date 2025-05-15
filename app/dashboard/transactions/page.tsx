"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit2, Plus, Search, Trash2 } from "lucide-react"
import ExpenseForm from "@/components/expense-form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TransactionsPage() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [transactions, setTransactions] = useState<any[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([])
  const [editingExpense, setEditingExpense] = useState<any>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState<number | null>(null)
  const [transactionType, setTransactionType] = useState<string>("all")

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
      setFilteredTransactions(loadedTransactions)
    }
  }, [showExpenseForm]) // Re-run when form closes to refresh data

  useEffect(() => {
    // Filter transactions based on search term, category, and transaction type
    let filtered = transactions

    if (searchTerm) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.category?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (categoryFilter && categoryFilter !== "all") {
      filtered = filtered.filter((transaction) => transaction.category === categoryFilter)
    }

    if (transactionType !== "all") {
      filtered = filtered.filter((transaction) => transaction.type === transactionType)
    }

    setFilteredTransactions(filtered)
  }, [searchTerm, categoryFilter, transactionType, transactions])

  if (!isClient) {
    return null // Prevent hydration errors
  }

  // Get unique categories for filter
  const categories = Array.from(
    new Set(
      transactions
        .map((t) => t.category)
        .filter((category): category is string => Boolean(category) && category.trim() !== "")
    )
  )

  const handleEditExpense = (expense: any) => {
    setEditingExpense(expense)
    setShowExpenseForm(true)
  }

  const handleDeleteExpense = (id: number) => {
    setExpenseToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = () => {
    if (expenseToDelete === null) return

    // Filter out the expense to delete
    const updatedExpenses = transactions.filter((expense) => expense.id !== expenseToDelete)

    // Update localStorage
    localStorage.setItem("userExpenses", JSON.stringify(updatedExpenses))

    // Update state
    setTransactions(updatedExpenses)
    setFilteredTransactions(updatedExpenses)

    // Close dialog
    setDeleteConfirmOpen(false)
    setExpenseToDelete(null)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Giao dịch</h2>
        <Button
          onClick={() => {
            setEditingExpense(null)
            setShowExpenseForm(true)
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" /> Thêm giao dịch
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách giao dịch</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="mb-6" onValueChange={setTransactionType}>
            <TabsList>
              <TabsTrigger value="all">Tất cả</TabsTrigger>
              <TabsTrigger value="income">Thu nhập</TabsTrigger>
              <TabsTrigger value="expense">Chi tiêu</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm giao dịch..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-[200px]">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Lọc theo danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Phương thức</TableHead>
                  <TableHead className="text-right">Số tiền</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{new Date(transaction.date).toLocaleDateString("vi-VN")}</TableCell>
                        <TableCell>
                          <Badge variant={transaction.type === "income" ? "success" : "destructive"}>
                            {transaction.type === "income" ? "Thu nhập" : "Chi tiêu"}
                          </Badge>
                        </TableCell>
                        <TableCell>{transaction.category}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>{transaction.paymentMethod || "Tiền mặt"}</TableCell>
                        <TableCell
                          className={`text-right font-medium ${
                            transaction.type === "income" ? "text-emerald-600" : "text-red-600"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          {transaction.amount.toLocaleString()} ₫
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditExpense(transaction)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500"
                              onClick={() => handleDeleteExpense(transaction.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      {transactions.length === 0
                        ? "Chưa có giao dịch nào. Hãy thêm giao dịch đầu tiên của bạn!"
                        : "Không tìm thấy giao dịch nào phù hợp với bộ lọc"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {showExpenseForm && (
        <ExpenseForm
          onClose={() => {
            setShowExpenseForm(false)
            setEditingExpense(null)
          }}
          editExpense={editingExpense}
        />
      )}

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa giao dịch này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
