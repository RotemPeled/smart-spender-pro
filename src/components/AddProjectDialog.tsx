import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddProjectDialogProps {
  onAdd: (project: any) => void;
}

export const AddProjectDialog = ({ onAdd }: AddProjectDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [price, setPrice] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isRetainer, setIsRetainer] = useState(false);
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

    onAdd({
      name,
      client_name: clientName,
      description: "",
      price: parseFloat(price),
      deadline: isRetainer ? null : (deadline || null),
      work_status: "in_progress",
      payment_status: "unpaid",
      priority: "medium",
      is_retainer: isRetainer,
    });

    // Reset form
    setName("");
    setClientName("");
    setPrice("");
    setDeadline("");
    setIsRetainer(false);
    setOpen(false);

    toast({
      title: "הצלחה",
      description: "הפרויקט נוסף בהצלחה",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-glow">
          <Plus className="w-4 h-4" />
          הוסף פרויקט
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto p-5 sm:p-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl">הוסף פרויקט חדש</DialogTitle>
          <DialogDescription className="text-sm">
            צור פרויקט חדש עם פרטים על העבודה והתשלום
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
            <label htmlFor="price" className="text-sm font-medium">
              מחיר *
            </label>
            <Input
              id="price"
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="retainer"
              checked={isRetainer}
              onCheckedChange={(checked) => setIsRetainer(checked as boolean)}
            />
            <label htmlFor="retainer" className="text-sm font-medium cursor-pointer">
              ריטיינר
            </label>
          </div>
          {!isRetainer && (
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
          )}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)}>
            ביטול
          </Button>
          <Button onClick={handleSubmit}>הוסף פרויקט</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
