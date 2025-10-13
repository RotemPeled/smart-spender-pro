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
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface AddProjectDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectAdded: () => void;
  projectId?: string;
  initialData?: {
    name: string;
    client_name?: string;
    price: number;
    deadline?: string;
    work_status?: string;
    payment_status?: string;
    priority?: string;
  };
}

export default function AddProjectDrawer({ 
  open, 
  onOpenChange, 
  onProjectAdded,
  projectId,
  initialData
}: AddProjectDrawerProps) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [price, setPrice] = useState("");
  const [deadline, setDeadline] = useState<Date | undefined>();
  const [workStatus, setWorkStatus] = useState("in_progress");
  const [paymentStatus, setPaymentStatus] = useState("unpaid");
  const [priority, setPriority] = useState("medium");
  const [loading, setLoading] = useState(false);

  // Reset form when drawer opens/closes or when initialData changes
  useEffect(() => {
    if (open && initialData) {
      setName(initialData.name);
      setClientName(initialData.client_name || "");
      setPrice(initialData.price.toString());
      setDeadline(initialData.deadline ? new Date(initialData.deadline) : undefined);
      setWorkStatus(initialData.work_status || "in_progress");
      setPaymentStatus(initialData.payment_status || "unpaid");
      setPriority(initialData.priority || "medium");
    } else if (open && !initialData) {
      setName("");
      setClientName("");
      setPrice("");
      setDeadline(undefined);
      setWorkStatus("in_progress");
      setPaymentStatus("unpaid");
      setPriority("medium");
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !price) {
      toast.error("נא למלא את כל השדות הנדרשים");
      return;
    }

    setLoading(true);
    
    try {
      const projectData = {
        user_id: user?.id,
        name,
        client_name: clientName,
        price: parseFloat(price),
        deadline: deadline?.toISOString(),
        work_status: workStatus as "in_progress" | "ready" | "completed",
        payment_status: paymentStatus as "paid" | "pending" | "unpaid",
        priority: priority as "low" | "medium" | "high",
      };

      let error;
      
      if (projectId) {
        // Update existing project
        const { error: updateError } = await supabase
          .from("projects")
          .update(projectData)
          .eq("id", projectId);
        error = updateError;
      } else {
        // Insert new project
        const { error: insertError } = await supabase
          .from("projects")
          .insert([projectData]);
        error = insertError;
      }

      if (error) throw error;

      toast.success(projectId ? "הפרויקט עודכן בהצלחה!" : "הפרויקט נוסף בהצלחה!");
      onProjectAdded();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error(projectId ? "שגיאה בעדכון הפרויקט" : "שגיאה בהוספת הפרויקט");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerOverlay className="bg-black/30 backdrop-blur-sm transition-opacity duration-300" />
      <DrawerContent className="bg-background border-t border-border/10 max-h-[90vh] overflow-y-auto pb-safe rounded-t-[32px] transition-transform duration-300 ease-in-out">
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-1 rounded-full bg-muted-foreground/20" />
        </div>

        <div className="px-6 pt-4 pb-24">
          <h2 className="text-2xl font-semibold text-foreground mb-7 text-center">
            {projectId ? "ערוך פרויקט" : "פרויקט חדש"}
          </h2>

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

          {/* Floating Add Button */}
          <div className="fixed bottom-6 left-6 right-6 z-50">
            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]" 
              disabled={loading}
              style={{
                boxShadow: '0 4px 16px rgba(0, 122, 255, 0.3)'
              }}
            >
              {loading ? "שומר..." : (projectId ? "שמור שינויים" : "הוסף פרויקט")}
            </Button>
          </div>
        </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
