import { useState } from "react";
import { Drawer, DrawerContent, DrawerOverlay } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Transaction } from "@/types";

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (transaction: Omit<Transaction, "id">) => void;
}

export const AddTransactionDialog = ({ open, onOpenChange, onAdd }: AddTransactionDialogProps) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount) {
      toast.error("נא למלא את הסכום");
      return;
    }

    onAdd({
      type: "expense",
      amount: parseFloat(amount),
      category: "הוצאה כללית",
      description: description || "",
      date: new Date(date),
    });

    toast.success("ההוצאה נוספה בהצלחה!");
    onOpenChange(false);
    setAmount("");
    setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerOverlay className="bg-black/20 backdrop-blur-sm" />
      <DrawerContent className="border-none outline-none max-h-[90vh]">
        <div 
          className="mx-auto w-full max-w-sm rounded-t-3xl bg-white/95 backdrop-blur-xl overflow-y-auto"
          style={{ boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.12)' }}
        >
          {/* Drag Handle */}
          <div className="flex justify-center pt-4 pb-2">
            <div className="w-10 h-1 rounded-full bg-gray-300/80" />
          </div>

          <div className="px-6 pb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">הוצאה חדשה</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-base">סכום *</Label>
            <Input
              id="amount"
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0"
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-base">תיאור</Label>
            <Input
              id="description"
              placeholder="הזן תיאור (אופציונלי)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-base">תאריך</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>

          <Button type="submit" className="w-full h-11 rounded-xl shadow-sm">
            הוסף הוצאה
          </Button>
        </form>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
