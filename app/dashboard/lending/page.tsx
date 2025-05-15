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

export default function LendingPage() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [showLendingForm, setShowLendingForm] = useState(false)
  const [lendings, setLendings] = useState<any[]>([])
  const [editingLending, setEditingLending] = useState<any>(null)
  const [lendingDate, setLendingDate] = useState<Date>(new Date())
  const [dueDate, setDueDate] = useState<Date>(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) // 30 days from now
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [lendingToDelete, setLendingToDelete] = useState<number | null>(null)
  const [totalLendingAmount, setTotalLendingAmount] = useState(0)

  useEffect(() => {
    setIsClient(true)
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    if (!isLoggedIn) {
      router.push("/login")
    }
  }, [router])

  useEffect(() => {
    // Load lendings from localStorage
    const lendingsJSON = localStorage.getItem("userLendings")
    if (lendingsJSON) {
      const loadedLendings = JSON.parse(lendingsJSON)
      setLendings(loadedLendings)

      // Calculate total lending amount
      const total = loadedLendings.reduce((sum: number, lending: any) => sum + lending.amount, 0)
      setTotalLendingAmount(total)
    }
  }, [showLendingForm])

  if (!isClient) {
    return null // Prevent hydration errors
  }

  const handleAddLending = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const amount = Number(formData.get("amount"))
    const borrower = formData.get("borrower") as string
    const description = formData.get("description") as string
    const interest = Number(formData.get("interest") || 0)

    // Create lending object
    const lending = {
      id: editingLending ? editingLending.id : Date.now(),
      amount,
      borrower,
      description,
      lendingDate: lendingDate.toISOString(),
      dueDate: dueDate.toISOString(),
      interest,
      isRepaid: editingLending ? editingLending.isRepaid : false,
    }

    let updatedLendings

    if (editingLending) {
      // Update existing lending
      updatedLendings = lendings.map((l) => (l.id === editingLending.id ? lending : l))
    } else {
      // Add new lending
      updatedLendings = [...lendings, lending]
    }

    // Save to localStorage
    localStorage.setItem("userLendings", JSON.stringify(updatedLendings))

    // Update state
    setLendings(updatedLendings)
    setTotalLendingAmount(updatedLendings.reduce((sum, l) => sum + l.amount, 0))

    // Close form and reset editing state
    setShowLendingForm(false)
    setEditingLending(null)
    setLendingDate(new Date())
    setDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
  }

  const handleDeleteLending = (id: number) => {
    setLendingToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = () => {
    if (lendingToDelete === null) return

    const updatedLendings = lendings.filter((lending) => lending.id !== lendingToDelete)

    // Save to localStorage
    localStorage.setItem("userLendings", JSON.stringify(updatedLendings))

    // Update state
    setLendings(updatedLendings)
    setTotalLendingAmount(updatedLendings.reduce((sum, l) => sum + l.amount, 0))

    // Close dialog
    setDeleteConfirmOpen(false)
    setLendingToDelete(null)
  }

  const handleEditLending = (lending: any) => {
    setEditingLending(lending)
    setLendingDate(new Date(lending.lendingDate))
    setDueDate(new Date(lending.dueDate))
    setShowLendingForm(true)
  }

  const toggleLendingStatus = (id: number) => {
    const updatedLendings = lendings.map((lending) => {
      if (lending.id === id) {
        return { ...lending, isRepaid: !lending.isRepaid }
      }
      return lending
    })

    // Save to localStorage
    localStorage.setItem("userLendings", JSON.stringify(updatedLendings))

    // Update state
    setLendings(updatedLendings)
  }

  // Calculate upcoming repayments (due in the next 30 days)
  const today = new Date()
  const upcomingRepayments = lendings
    .filter((lending) => !lending.isRepaid && new Date(lending.dueDate) > today)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3)

  // Calculate overdue lendings
  const overdueLendings = lendings.filter((lending) => !lending.isRepaid && new Date(lending.dueDate) < today)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Khoản cho vay</h2>
        <Button onClick={() => setShowLendingForm(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Thêm khoản cho vay
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="all-lendings">Tất cả khoản cho vay</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tổng khoản cho vay</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">{totalLendingAmount.toLocaleString()} ₫</div>
                <p className="text-xs text-muted-foreground">Tổng số tiền bạn đã cho vay</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Khoản vay quá hạn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {overdueLendings.reduce((sum, lending) => sum + lending.amount, 0).toLocaleString()} ₫
                </div>
                <p className="text-xs text-muted-foreground">
                  {overdueLendings.length} khoản vay chưa được trả đúng hạn
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Khoản vay đã được trả</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {lendings
                    .filter((lending) => lending.isRepaid)
                    .reduce((sum, lending) => sum + lending.amount, 0)
                    .toLocaleString()}{" "}
                  ₫
                </div>
                <p className="text-xs text-muted-foreground">
                  {lendings.filter((lending) => lending.isRepaid).length} khoản vay đã được hoàn trả
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Khoản vay sắp đến hạn</CardTitle>
              <CardDescription>Các khoản vay dự kiến được hoàn trả trong thời gian tới</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingRepayments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingRepayments.map((lending) => {
                    const daysLeft = Math.ceil(
                      (new Date(lending.dueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
                    )
                    return (
                      <div key={lending.id} className="flex items-center justify-between border-b pb-2">
                        <div>
                          <div className="font-medium">{lending.borrower}</div>
                          <div className="text-sm text-muted-foreground">{lending.description}</div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="font-medium">{lending.amount.toLocaleString()} ₫</div>
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

        <TabsContent value="all-lendings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tất cả khoản cho vay</CardTitle>
              <CardDescription>Danh sách tất cả các khoản bạn đã cho vay</CardDescription>
            </CardHeader>
            <CardContent>
              {lendings.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Người vay</TableHead>
                        <TableHead>Mô tả</TableHead>
                        <TableHead>Ngày cho vay</TableHead>
                        <TableHead>Hạn trả</TableHead>
                        <TableHead>Lãi suất (%)</TableHead>
                        <TableHead className="text-right">Số tiền</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lendings
                        .sort((a, b) => (a.isRepaid === b.isRepaid ? 0 : a.isRepaid ? 1 : -1))
                        .map((lending) => (
                          <TableRow key={lending.id}>
                            <TableCell>{lending.borrower}</TableCell>
                            <TableCell>{lending.description}</TableCell>
                            <TableCell>{new Date(lending.lendingDate).toLocaleDateString("vi-VN")}</TableCell>
                            <TableCell>{new Date(lending.dueDate).toLocaleDateString("vi-VN")}</TableCell>
                            <TableCell>{lending.interest || 0}%</TableCell>
                            <TableCell className="text-right font-medium">
                              {lending.amount.toLocaleString()} ₫
                            </TableCell>
                            <TableCell>
                              <Button
                                variant={lending.isRepaid ? "outline" : "destructive"}
                                size="sm"
                                onClick={() => toggleLendingStatus(lending.id)}
                              >
                                {lending.isRepaid ? "Đã trả" : "Chưa trả"}
                              </Button>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEditLending(lending)}>
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-500"
                                  onClick={() => handleDeleteLending(lending.id)}
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
                  Bạn chưa có khoản cho vay nào. Hãy thêm khoản cho vay đầu tiên của bạn!
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Lending Form Dialog */}
      <Dialog open={showLendingForm} onOpenChange={setShowLendingForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLending ? "Chỉnh sửa khoản cho vay" : "Thêm khoản cho vay mới"}</DialogTitle>
            <DialogDescription>
              {editingLending
                ? "Cập nhật thông tin khoản cho vay của bạn."
                : "Nhập thông tin khoản cho vay mới để theo dõi."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddLending}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="borrower">Người vay</Label>
                <Input
                  id="borrower"
                  name="borrower"
                  defaultValue={editingLending?.borrower}
                  placeholder="Tên người vay"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="amount">Số tiền cho vay</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  placeholder="0"
                  defaultValue={editingLending?.amount}
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
                  defaultValue={editingLending?.interest || 0}
                />
              </div>

              <div className="grid gap-2">
                <Label>Ngày cho vay</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {lendingDate ? format(lendingDate, "PPP", { locale: vi }) : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={lendingDate}
                      onSelect={(date) => date && setLendingDate(date)}
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
                  defaultValue={editingLending?.description}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowLendingForm(false)
                  setEditingLending(null)
                  setLendingDate(new Date())
                  setDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
                }}
              >
                Hủy
              </Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                {editingLending ? "Cập nhật" : "Lưu"}
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
              Bạn có chắc chắn muốn xóa khoản cho vay này? Hành động này không thể hoàn tác.
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
