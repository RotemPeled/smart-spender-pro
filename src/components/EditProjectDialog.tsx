import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EditProjectDialogProps {
  project: any;
  onUpdate: (projectId: string, projectData: any) => void;
}

export const EditProjectDialog = ({ project, onUpdate }: EditProjectDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(project.name);
  const [clientName, setClientName] = useState(project.client_name || "");
  const [description, setDescription] = useState(project.description || "");
  const [price, setPrice] = useState(project.price.toString());
  const [deadline, setDeadline] = useState(project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : "");
  const [workStatus, setWorkStatus] = useState<"in_progress" | "ready" | "completed">(project.work_status);
  const [paymentStatus, setPaymentStatus] = useState<"paid" | "unpaid" | "pending">(project.payment_status);
  const [priority, setPriority] = useState<"high" | "medium" | "low">(project.priority);
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!name || !price) {
      toast({
        title: "שגיאה",
        description: "נא למלא את כל השדות הנדרשים",
        variant: "destructive",
      });
      return;
    }

    onUpdate(project.id, {
      name,
      client_name: clientName,
      description,
      price: parseFloat(price),
      deadline: deadline || null,
      work_status: workStatus,
      payment_status: paymentStatus,
      priority,
    });

    setOpen(false);

    toast({
      title: "הצלחה",
      description: "הפרויקט עודכן בהצלחה",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Pencil className="w-4 h-4" />
          ערוך
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ערוך פרויקט</DialogTitle>
          <DialogDescription>
            ערוך את פרטי הפרויקט והסטטוסים.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-medium">
              שם הפרויקט *
            </label>
            <Input
              id="name"
              placeholder="הזן שם פרויקט"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="clientName" className="text-sm font-medium">
              שם הלקוח
            </label>
            <Input
              id="clientName"
              placeholder="הזן שם לקוח"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium">
              תיאור
            </label>
            <Textarea
              id="description"
              placeholder="הזן תיאור פרויקט"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="price" className="text-sm font-medium">
              מחיר *
            </label>
            <Input
              id="price"
              type="number"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="deadline" className="text-sm font-medium">
              מועד אספקה
            </label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="priority" className="text-sm font-medium">
              עדיפות
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="low">נמוכה</option>
              <option value="medium">בינונית</option>
              <option value="high">גבוהה</option>
            </select>
          </div>
          <div className="grid gap-2">
            <label htmlFor="workStatus" className="text-sm font-medium">
              סטטוס עבודה
            </label>
            <select
              id="workStatus"
              value={workStatus}
              onChange={(e) => setWorkStatus(e.target.value as any)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="in_progress">בתהליך</option>
              <option value="ready">מוכן</option>
              <option value="completed">הושלם</option>
            </select>
          </div>
          <div className="grid gap-2">
            <label htmlFor="paymentStatus" className="text-sm font-medium">
              סטטוס תשלום
            </label>
            <select
              id="paymentStatus"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as any)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="unpaid">לא שולם</option>
              <option value="pending">ממתין</option>
              <option value="paid">שולם</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            ביטול
          </Button>
          <Button onClick={handleSubmit}>שמור שינויים</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
