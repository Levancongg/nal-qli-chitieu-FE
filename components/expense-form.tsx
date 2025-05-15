"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface ExpenseFormProps {
  onClose: () => void
  editExpense?: any
}

export default function ExpenseForm({ onClose, editExpense }: ExpenseFormProps) {
  const [date, setDate] = useState<Date>(editExpense ? new Date(editExpense.date) : new Date())
  const [amount, setAmount] = useState<string>(editExpense ? editExpense.amount.toString() : "0")
  const [category, setCategory] = useState<string>(editExpense ? editExpense.category : "Thực phẩm")
  const [description, setDescription] = useState<string>(editExpense ? editExpense.description : "")
  const [paymentMethod, setPaymentMethod] = useState<string>(editExpense ? editExpense.paymentMethod : "Tiền mặt")
  const [type, setType] = useState<string>(editExpense ? editExpense.type : "expense")

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    // Create transaction object
    const transaction = {
      id: editExpense ? editExpense.id : Date.now(),
      date: date.toISOString(),
      amount: Number(amount),
      category,
      description,
      paymentMethod,
      type, // 'income' or 'expense'
    }

    // Get existing transactions from localStorage
    const transactionsJSON = localStorage.getItem("userExpenses")
    let transactions = transactionsJSON ? JSON.parse(transactionsJSON) : []

    if (editExpense) {
      // Update existing transaction
      transactions = transactions.map((exp: any) => (exp.id === editExpense.id ? transaction : exp))
    } else {
      // Add new transaction
      transactions.push(transaction)
    }

    // Save back to localStorage
    localStorage.setItem("userExpenses", JSON.stringify(transactions))

    // Close the form
    onClose()
  }

  // Categories based on transaction type
  const incomeCategories = ["Lương", "Thưởng", "Đầu tư", "Tiền lãi", "Quà tặng", "Bán hàng", "Cho thuê", "Khác"]

  const expenseCategories = [
    "Thực phẩm",
    "Giao thông",
    "Giải trí",
    "Hóa đơn",
    "Mua sắm",
    "Sức khỏe",
    "Giáo dục",
    "Nhà cửa",
    "Khác",
  ]

  const currentCategories = type === "income" ? incomeCategories : expenseCategories

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editExpense ? "Chỉnh sửa giao dịch" : "Thêm giao dịch mới"}</DialogTitle>
          <DialogDescription>
            {editExpense
              ? "Chỉnh sửa thông tin giao dịch của bạn. Nhấn lưu khi hoàn tất."
              : "Nhập thông tin giao dịch của bạn. Nhấn lưu khi hoàn tất."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Loại giao dịch</Label>
              <RadioGroup value={type} onValueChange={setType} className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="income" id="income" />
                  <Label htmlFor="income" className="font-normal">
                    Thu nhập
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="expense" id="expense" />
                  <Label htmlFor="expense" className="font-normal">
                    Chi tiêu
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">Số tiền</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Danh mục</Label>
              <Select name="category" value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {currentCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="paymentMethod">Phương thức thanh toán</Label>
              <Select name="paymentMethod" value={paymentMethod} onValueChange={setPaymentMethod} required>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn phương thức thanh toán" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tiền mặt">Tiền mặt</SelectItem>
                  <SelectItem value="Thẻ tín dụng">Thẻ tín dụng</SelectItem>
                  <SelectItem value="Thẻ ghi nợ">Thẻ ghi nợ</SelectItem>
                  <SelectItem value="Chuyển khoản">Chuyển khoản</SelectItem>
                  <SelectItem value="Ví điện tử">Ví điện tử</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date">Ngày</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: vi }) : "Chọn ngày"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Mô tả giao dịch của bạn"
                className="resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit">Lưu</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
