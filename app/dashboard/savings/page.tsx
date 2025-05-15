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
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SavingsPage() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [showSavingForm, setShowSavingForm] = useState(false)
  const [savings, setSavings] = useState<any[]>([])
  const [editingSaving, setEditingSaving] = useState<any>(null)
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [targetDate, setTargetDate] = useState<Date>(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)) // 1 year from now
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [savingToDelete, setSavingToDelete] = useState<number | null>(null)
  const [totalSavings, setTotalSavings] = useState(0)

  useEffect(() => {
    setIsClient(true)
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    if (!isLoggedIn) {
      router.push("/login")
    }
  }, [router])

  useEffect(() => {
    // Load savings from localStorage
    const savingsJSON = localStorage.getItem("userSavings")
    if (savingsJSON) {
      const loadedSavings = JSON.parse(savingsJSON)
      setSavings(loadedSavings)

      // Calculate total current savings
      const total = loadedSavings.reduce((sum: number, saving: any) => sum + saving.currentAmount, 0)
      setTotalSavings(total)
    }
  }, [showSavingForm])

  if (!isClient) {
    return null // Prevent hydration errors
  }

  const handleAddSaving = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const targetAmount = Number(formData.get("targetAmount"))
    const currentAmount = Number(formData.get("currentAmount") || 0)
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const priority = formData.get("priority") as string

    // Create saving object
    const saving = {
      id: editingSaving ? editingSaving.id : Date.now(),
      name,
      description,
      targetAmount,
      currentAmount,
      startDate: startDate.toISOString(),
      targetDate: targetDate.toISOString(),
      priority: priority || "Medium",
      isCompleted: editingSaving ? editingSaving.isCompleted : false,
    }

    let updatedSavings

    if (editingSaving) {
      // Update existing saving
      updatedSavings = savings.map((s) => (s.id === editingSaving.id ? saving : s))
    } else {
      // Add new saving
      updatedSavings = [...savings, saving]
    }

    // Save to localStorage
    localStorage.setItem("userSavings", JSON.stringify(updatedSavings))

    // Update state
    setSavings(updatedSavings)
    setTotalSavings(updatedSavings.reduce((sum, s) => sum + s.currentAmount, 0))

    // Close form and reset editing state
    setShowSavingForm(false)
    setEditingSaving(null)
    setStartDate(new Date())
    setTargetDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000))
  }

  const handleDeleteSaving = (id: number) => {
    setSavingToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = () => {
    if (savingToDelete === null) return

    const updatedSavings = savings.filter((saving) => saving.id !== savingToDelete)

    // Save to localStorage
    localStorage.setItem("userSavings", JSON.stringify(updatedSavings))

    // Update state
    setSavings(updatedSavings)
    setTotalSavings(updatedSavings.reduce((sum, s) => sum + s.currentAmount, 0))

    // Close dialog
    setDeleteConfirmOpen(false)
    setSavingToDelete(null)
  }

  const handleEditSaving = (saving: any) => {
    setEditingSaving(saving)
    setStartDate(new Date(saving.startDate))
    setTargetDate(new Date(saving.targetDate))
    setShowSavingForm(true)
  }

  const toggleSavingStatus = (id: number) => {
    const updatedSavings = savings.map((saving) => {
      if (saving.id === id) {
        return { ...saving, isCompleted: !saving.isCompleted }
      }
      return saving
    })

    // Save to localStorage
    localStorage.setItem("userSavings", JSON.stringify(updatedSavings))

    // Update state
    setSavings(updatedSavings)
  }

  // Calculate closest target date savings
  const today = new Date()
  const upcomingSavings = savings
    .filter((saving) => !saving.isCompleted && new Date(saving.targetDate) > today)
    .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())
    .slice(0, 3)

  // Calculate total targets
  const totalTargets = savings.reduce((sum, saving) => sum + saving.targetAmount, 0)

  // Calculate saving progress
  const calculateProgress = (saving: any) => {
    return Math.min(Math.round((saving.currentAmount / saving.targetAmount) * 100), 100)
  }

  // Calculate days left
  const calculateDaysLeft = (targetDate: string) => {
    const daysLeft = Math.ceil((new Date(targetDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysLeft > 0 ? daysLeft : 0
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Khoản tiết kiệm</h2>
        <Button onClick={() => setShowSavingForm(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Thêm mục tiêu tiết kiệm
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="all-savings">Tất cả mục tiêu</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tổng tiết kiệm hiện tại</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">{totalSavings.toLocaleString()} ₫</div>
                <p className="text-xs text-muted-foreground">Tổng số tiền đã tích lũy</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tổng mục tiêu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTargets.toLocaleString()} ₫</div>
                <p className="text-xs text-muted-foreground">Tổng số tiền mục tiêu</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tiến độ tiết kiệm</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalTargets > 0 ? Math.round((totalSavings / totalTargets) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">Tiến độ đạt mục tiêu tổng thể</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Mục tiêu tiết kiệm tiếp theo</CardTitle>
              <CardDescription>Các mục tiêu tiết kiệm gần đến hạn nhất</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingSavings.length > 0 ? (
                <div className="space-y-6">
                  {upcomingSavings.map((saving) => {
                    const progress = calculateProgress(saving)
                    const daysLeft = calculateDaysLeft(saving.targetDate)
                    return (
                      <div key={saving.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{saving.name}</div>
                            <div className="text-sm text-muted-foreground">{saving.description}</div>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="font-medium">
                              {saving.currentAmount.toLocaleString()} / {saving.targetAmount.toLocaleString()} ₫
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Còn {daysLeft} ngày ({new Date(saving.targetDate).toLocaleDateString("vi-VN")})
                            </div>
                          </div>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  Bạn chưa có mục tiêu tiết kiệm nào. Hãy tạo mục tiêu đầu tiên của bạn!
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all-savings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tất cả mục tiêu tiết kiệm</CardTitle>
              <CardDescription>Danh sách tất cả các mục tiêu tiết kiệm của bạn</CardDescription>
            </CardHeader>
            <CardContent>
              {savings.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên mục tiêu</TableHead>
                        <TableHead>Mô tả</TableHead>
                        <TableHead>Ngày bắt đầu</TableHead>
                        <TableHead>Hạn đạt được</TableHead>
                        <TableHead>Tiến độ</TableHead>
                        <TableHead className="text-right">Số tiền/Mục tiêu</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {savings
                        .sort((a, b) => (a.isCompleted === b.isCompleted ? 0 : a.isCompleted ? 1 : -1))
                        .map((saving) => {
                          const progress = calculateProgress(saving)
                          return (
                            <TableRow key={saving.id}>
                              <TableCell className="font-medium">{saving.name}</TableCell>
                              <TableCell>{saving.description}</TableCell>
                              <TableCell>{new Date(saving.startDate).toLocaleDateString("vi-VN")}</TableCell>
                              <TableCell>{new Date(saving.targetDate).toLocaleDateString("vi-VN")}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Progress value={progress} className="h-2 w-20" />
                                  <span className="text-xs">{progress}%</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                {saving.currentAmount.toLocaleString()} / {saving.targetAmount.toLocaleString()} ₫
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant={saving.isCompleted ? "outline" : progress === 100 ? "success" : "default"}
                                  size="sm"
                                  onClick={() => toggleSavingStatus(saving.id)}
                                >
                                  {saving.isCompleted
                                    ? "Hoàn thành"
                                    : progress === 100
                                      ? "Đạt mục tiêu"
                                      : "Đang tiết kiệm"}
                                </Button>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="icon" onClick={() => handleEditSaving(saving)}>
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500"
                                    onClick={() => handleDeleteSaving(saving.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  Bạn chưa có mục tiêu tiết kiệm nào. Hãy tạo mục tiêu đầu tiên của bạn!
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Saving Form Dialog */}
      <Dialog open={showSavingForm} onOpenChange={setShowSavingForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSaving ? "Chỉnh sửa mục tiêu tiết kiệm" : "Thêm mục tiêu tiết kiệm mới"}</DialogTitle>
            <DialogDescription>
              {editingSaving
                ? "Cập nhật thông tin mục tiêu tiết kiệm của bạn."
                : "Nhập thông tin cho mục tiêu tiết kiệm mới của bạn."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSaving}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Tên mục tiêu</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingSaving?.name}
                  placeholder="Ví dụ: Mua xe, Du lịch..."
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="targetAmount">Số tiền mục tiêu</Label>
                <Input
                  id="targetAmount"
                  name="targetAmount"
                  type="number"
                  placeholder="0"
                  defaultValue={editingSaving?.targetAmount}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="currentAmount">Số tiền hiện tại</Label>
                <Input
                  id="currentAmount"
                  name="currentAmount"
                  type="number"
                  placeholder="0"
                  defaultValue={editingSaving?.currentAmount || 0}
                />
              </div>

              <div className="grid gap-2">
                <Label>Ngày bắt đầu</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP", { locale: vi }) : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => date && setStartDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label>Hạn đạt được</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {targetDate ? format(targetDate, "PPP", { locale: vi }) : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={targetDate}
                      onSelect={(date) => date && setTargetDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="priority">Mức độ ưu tiên</Label>
                <Select name="priority" defaultValue={editingSaving?.priority || "Medium"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn mức độ ưu tiên" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">Cao</SelectItem>
                    <SelectItem value="Medium">Trung bình</SelectItem>
                    <SelectItem value="Low">Thấp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Mô tả</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Mô tả mục tiêu tiết kiệm của bạn"
                  defaultValue={editingSaving?.description}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowSavingForm(false)
                  setEditingSaving(null)
                  setStartDate(new Date())
                  setTargetDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000))
                }}
              >
                Hủy
              </Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                {editingSaving ? "Cập nhật" : "Lưu"}
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
              Bạn có chắc chắn muốn xóa mục tiêu tiết kiệm này? Hành động này không thể hoàn tác.
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
