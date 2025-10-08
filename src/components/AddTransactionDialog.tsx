import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddTransactionDialogProps {
  onAdd: (transaction: any) => void;
}

const incomeCategories = ["משכורת", "פרילנס", "השקעות", "עסק", "אחר"];
const expenseCategories = ["שכר דירה", "חשמל ומים", "שיווק", "ציוד", "נסיעות", "תוכנה", "אחר"];

export const AddTransactionDialog = ({ onAdd }: AddTransactionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"income" | "expense">("income");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!amount || !category) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את כל השדות הנדרשים",
        variant: "destructive",
      });
      return;
    }

    onAdd({
      type,
      amount: parseFloat(amount),
      category,
      description,
      date: date,
    });

    // Reset form
    setAmount("");
    setCategory("");
    setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
    setOpen(false);

    toast({
      title: "הצלחה",
      description: "התנועה נוספה בהצלחה",
    });
  };

  const categories = type === "income" ? incomeCategories : expenseCategories;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-glow">
          <Plus className="w-4 h-4" />
          הוסף תנועה
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>הוסף תנועה חדשה</DialogTitle>
          <DialogDescription>
            הוסף הכנסה או הוצאה חדשה למעקב הכספי שלך
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="type" className="text-sm font-medium">
              סוג
            </label>
            <Select value={type} onValueChange={(value: "income" | "expense") => {
              setType(value);
              setCategory("");
            }}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="income">הכנסה</SelectItem>
                <SelectItem value="expense">הוצאה</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label htmlFor="amount" className="text-sm font-medium">
              סכום
            </label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="category" className="text-sm font-medium">
              קטגוריה
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="בחר קטגוריה" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium">
              תיאור
            </label>
            <Input
              id="description"
              placeholder="הכנס תיאור"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="date" className="text-sm font-medium">
              תאריך
            </label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            ביטול
          </Button>
          <Button onClick={handleSubmit}>הוסף תנועה</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
