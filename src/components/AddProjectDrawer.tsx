import { Drawer, DrawerContent, DrawerOverlay } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function AddProjectDrawer({ 
  open, 
  onOpenChange, 
  onProjectAdded 
}: { 
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectAdded: () => void;
}) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [price, setPrice] = useState("");
  const [deadline, setDeadline] = useState<Date | undefined>();
  const [workStatus, setWorkStatus] = useState("in_progress");
  const [paymentStatus, setPaymentStatus] = useState("unpaid");
  const [priority, setPriority] = useState("medium");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !price) {
      toast.error("נא למלא את כל השדות הנדרשים");
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.from("projects").insert([{
        user_id: user?.id,
        name,
        client_name: clientName,
        price: parseFloat(price),
        deadline: deadline?.toISOString(),
        work_status: workStatus as "in_progress" | "ready" | "completed",
        payment_status: paymentStatus as "paid" | "pending" | "unpaid",
        priority: priority as "low" | "medium" | "high",
      }]);

      if (error) throw error;

      toast.success("הפרויקט נוסף בהצלחה!");
      onProjectAdded();
      onOpenChange(false);
      // Reset form
      setName("");
      setClientName("");
      setPrice("");
      setDeadline(undefined);
      setWorkStatus("in_progress");
      setPaymentStatus("unpaid");
      setPriority("medium");
    } catch (error) {
      console.error("Error adding project:", error);
      toast.error("שגיאה בהוספת הפרויקט");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerOverlay className="bg-black/30 backdrop-blur-sm" />
      <DrawerContent className="bg-background border-t border-border/10 max-h-[90vh] overflow-y-auto pb-safe">
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-1 rounded-full bg-muted-foreground/20" />
        </div>

        <div className="px-6 pt-4 pb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-7 text-center">פרויקט חדש</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base">שם הפרויקט *</Label>
            <Input
              id="name"
              placeholder="הזן שם פרויקט"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientName" className="text-base">שם הלקוח</Label>
            <Input
              id="clientName"
              placeholder="הזן שם לקוח"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price" className="text-base">מחיר *</Label>
            <Input
              id="price"
              type="number"
              inputMode="numeric"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              step="0.01"
              min="0"
              required
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base">מועד אספקה</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-11 rounded-xl justify-start text-right font-normal",
                    !deadline && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {deadline ? format(deadline, "PPP", { locale: he }) : "בחר תאריך"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={setDeadline}
                  initialFocus
                  locale={he}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-base">סטטוס עבודה</Label>
              <Select value={workStatus} onValueChange={setWorkStatus}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_progress">בתהליך</SelectItem>
                  <SelectItem value="ready">מוכן</SelectItem>
                  <SelectItem value="completed">הושלם</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-base">סטטוס תשלום</Label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">לא שולם</SelectItem>
                  <SelectItem value="pending">ממתין</SelectItem>
                  <SelectItem value="paid">שולם</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-base">עדיפות</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">נמוכה</SelectItem>
                <SelectItem value="medium">בינונית</SelectItem>
                <SelectItem value="high">גבוהה</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full h-12 rounded-xl" disabled={loading}>
            {loading ? "שומר..." : "הוסף פרויקט"}
          </Button>
        </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
