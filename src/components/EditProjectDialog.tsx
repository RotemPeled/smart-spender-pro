import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

interface EditProjectDialogProps {
  project: any;
  onUpdate: (projectId: string, projectData: any) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditProjectDialog = ({ project, onUpdate, open, onOpenChange }: EditProjectDialogProps) => {
  const [name, setName] = useState(project.name);
  const [clientName, setClientName] = useState(project.client_name || "");
  const [price, setPrice] = useState(project.price.toString());
  const [deadline, setDeadline] = useState(project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : "");
  const [isRetainer, setIsRetainer] = useState(project.is_retainer || false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setName(project.name);
      setClientName(project.client_name || "");
      setPrice(project.price.toString());
      setDeadline(project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : "");
      setIsRetainer(project.is_retainer || false);
    }
  }, [open, project]);

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
      description: project.description || "",
      price: parseFloat(price),
      deadline: isRetainer ? null : (deadline || null),
      is_retainer: isRetainer,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto p-5 sm:p-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl">ערוך פרויקט</DialogTitle>
          <DialogDescription className="text-sm">
            ערוך את פרטי הפרויקט והסטטוסים
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ביטול
          </Button>
          <Button onClick={handleSubmit}>שמור שינויים</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
