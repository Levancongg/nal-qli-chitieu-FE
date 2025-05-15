"use client"

import type React from "react"

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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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

export default function LoansPage() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [showLoanForm, setShowLoanForm] = useState(false)
  const [loans, setLoans] = useState<any[]>([])
  const [editingLoan, setEditingLoan] = useState<any>(null)
  const [loanDate, setLoanDate] = useState<Date>(new Date())
  const [dueDate, setDueDate] = useState<Date>(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) // 30 days from now
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [loanToDelete, setLoanToDelete] = useState<number | null>(null)
  const [totalLoanAmount, setTotalLoanAmount] = useState(0)

  useEffect(() => {
    setIsClient(true)
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    if (!isLoggedIn) {
      router.push("/login")
    }
  }, [router])

  useEffect(() => {
    // Load loans from localStorage
    const loansJSON = localStorage.getItem("userLoans")
    if (loansJSON) {
      const loadedLoans = JSON.parse(loansJSON)
      setLoans(loadedLoans)

      // Calculate total loan amount
      const total = loadedLoans.reduce((sum: number, loan: any) => sum + loan.amount, 0)
      setTotalLoanAmount(total)
    }
  }, [showLoanForm])

  if (!isClient) {
    return null // Prevent hydration errors
  }

  const handleAddLoan = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const amount = Number(formData.get("amount"))
    const creditor = formData.get("creditor") as string
    const description = formData.get("description") as string
    const interest = Number(formData.get("interest") || 0)

    // Create loan object
    const loan = {
      id: editingLoan ? editingLoan.id : Date.now(),
      amount,
      creditor,
      description,
      loanDate: loanDate.toISOString(),
      dueDate: dueDate.toISOString(),
      interest,
      isPaid: editingLoan ? editingLoan.isPaid : false,
    }

    let updatedLoans

    if (editingLoan) {
      // Update existing loan
      updatedLoans = loans.map((l) => (l.id === editingLoan.id ? loan : l))
    } else {
      // Add new loan
      updatedLoans = [...loans, loan]
    }

    // Save to localStorage
    localStorage.setItem("userLoans", JSON.stringify(updatedLoans))

    // Update state
    setLoans(updatedLoans)
    setTotalLoanAmount(updatedLoans.reduce((sum, l) => sum + l.amount, 0))

    // Close form and reset editing state
    setShowLoanForm(false)
    setEditingLoan(null)
    setLoanDate(new Date())
    setDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
  }

  const handleDeleteLoan = (id: number) => {
    setLoanToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = () => {
    if (loanToDelete === null) return

    const updatedLoans = loans.filter((loan) => loan.id !== loanToDelete)

    // Save to localStorage
    localStorage.setItem("userLoans", JSON.stringify(updatedLoans))

    // Update state
    setLoans(updatedLoans)
    setTotalLoanAmount(updatedLoans.reduce((sum, l) => sum + l.amount, 0))

    // Close dialog
    setDeleteConfirmOpen(false)
    setLoanToDelete(null)
  }

  const handleEditLoan = (loan: any) => {
    setEditingLoan(loan)
    setLoanDate(new Date(loan.loanDate))
    setDueDate(new Date(loan.dueDate))
    setShowLoanForm(true)
  }

  const toggleLoanStatus = (id: number) => {
    const updatedLoans = loans.map((loan) => {
      if (loan.id === id) {
        return { ...loan, isPaid: !loan.isPaid }
      }
      return loan
    })

    // Save to localStorage
    localStorage.setItem("userLoans", JSON.stringify(updatedLoans))

    // Update state
    setLoans(updatedLoans)
  }

  // Calculate upcoming loans (due in the next 30 days)
  const today = new Date()
  const upcomingLoans = loans
    .filter((loan) => !loan.isPaid && new Date(loan.dueDate) > today)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3)

  // Calculate overdue loans
  const overdueLoans = loans.filter((loan) => !loan.isPaid && new Date(loan.dueDate) < today)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Khoản đi vay</h2>
        <Button onClick={() => setShowLoanForm(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Thêm khoản vay
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="all-loans">Tất cả khoản vay</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tổng khoản vay</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{totalLoanAmount.toLocaleString()} ₫</div>
                <p className="text-xs text-muted-foreground">Tổng số tiền bạn đang đi vay</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Khoản vay quá hạn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {overdueLoans.reduce((sum, loan) => sum + loan.amount, 0).toLocaleString()} ₫
                </div>
                <p className="text-xs text-muted-foreground">{overdueLoans.length} khoản vay quá hạn</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Khoản vay đã trả</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {loans
                    .filter((loan) => loan.isPaid)
                    .reduce((sum, loan) => sum + loan.amount, 0)
                    .toLocaleString()}{" "}
                  ₫
                </div>
                <p className="text-xs text-muted-foreground">
                  {loans.filter((loan) => loan.isPaid).length} khoản vay đã thanh toán
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Khoản vay sắp đến hạn</CardTitle>
              <CardDescription>Các khoản vay cần thanh toán trong thời gian tới</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingLoans.length > 0 ? (
                <div className="space-y-4">
                  {upcomingLoans.map((loan) => {
                    const daysLeft = Math.ceil(
                      (new Date(loan.dueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
                    )
                    return (
                      <div key={loan.id} className="flex items-center justify-between border-b pb-2">
                        <div>
                          <div className="font-medium">{loan.creditor}</div>
                          <div className="text-sm text-muted-foreground">{loan.description}</div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="font-medium">{loan.amount.toLocaleString()} ₫</div>
                          <div className="text-xs text-red-500">
                            {daysLeft <= 0 ? "Quá hạn" : `Còn ${daysLeft} ngày`}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">Không có khoản vay nào sắp đến hạn</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all-loans" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tất cả khoản vay</CardTitle>
              <CardDescription>Danh sách tất cả các khoản vay của bạn</CardDescription>
            </CardHeader>
            <CardContent>
              {loans.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Người cho vay</TableHead>
                        <TableHead>Mô tả</TableHead>
                        <TableHead>Ngày vay</TableHead>
                        <TableHead>Hạn trả</TableHead>
                        <TableHead>Lãi suất (%)</TableHead>
                        <TableHead className="text-right">Số tiền</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loans
                        .sort((a, b) => (a.isPaid === b.isPaid ? 0 : a.isPaid ? 1 : -1))
                        .map((loan) => (
                          <TableRow key={loan.id}>
                            <TableCell>{loan.creditor}</TableCell>
                            <TableCell>{loan.description}</TableCell>
                            <TableCell>{new Date(loan.loanDate).toLocaleDateString("vi-VN")}</TableCell>
                            <TableCell>{new Date(loan.dueDate).toLocaleDateString("vi-VN")}</TableCell>
                            <TableCell>{loan.interest || 0}%</TableCell>
                            <TableCell className="text-right font-medium">{loan.amount.toLocaleString()} ₫</TableCell>
                            <TableCell>
                              <Button
                                variant={loan.isPaid ? "outline" : "destructive"}
                                size="sm"
                                onClick={() => toggleLoanStatus(loan.id)}
                              >
                                {loan.isPaid ? "Đã trả" : "Chưa trả"}
                              </Button>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEditLoan(loan)}>
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-500"
                                  onClick={() => handleDeleteLoan(loan.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  Bạn chưa có khoản vay nào. Hãy thêm khoản vay đầu tiên của bạn!
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Loan Form Dialog */}
      <Dialog open={showLoanForm} onOpenChange={setShowLoanForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLoan ? "Chỉnh sửa khoản vay" : "Thêm khoản vay mới"}</DialogTitle>
            <DialogDescription>
              {editingLoan ? "Cập nhật thông tin khoản vay của bạn." : "Nhập thông tin khoản vay mới để theo dõi."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddLoan}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="creditor">Người cho vay</Label>
                <Input
                  id="creditor"
                  name="creditor"
                  defaultValue={editingLoan?.creditor}
                  placeholder="Tên người cho vay"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="amount">Số tiền vay</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  placeholder="0"
                  defaultValue={editingLoan?.amount}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="interest">Lãi suất (%/năm)</Label>
                <Input
                  id="interest"
                  name="interest"
                  type="number"
                  placeholder="0"
                  step="0.1"
                  defaultValue={editingLoan?.interest || 0}
                />
              </div>

              <div className="grid gap-2">
                <Label>Ngày vay</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {loanDate ? format(loanDate, "PPP", { locale: vi }) : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={loanDate}
                      onSelect={(date) => date && setLoanDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label>Hạn trả</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP", { locale: vi }) : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={(date) => date && setDueDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Mô tả</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Mục đích vay"
                  defaultValue={editingLoan?.description}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowLoanForm(false)
                  setEditingLoan(null)
                  setLoanDate(new Date())
                  setDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
                }}
              >
                Hủy
              </Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                {editingLoan ? "Cập nhật" : "Lưu"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa khoản vay này? Hành động này không thể hoàn tác.
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
