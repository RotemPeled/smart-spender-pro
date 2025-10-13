import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function EditProject() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [price, setPrice] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isRetainer, setIsRetainer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .eq("user_id", user?.id)
        .single();

      if (error) {
        console.error("Error fetching project:", error);
        navigate('/projects');
        return;
      }

      if (data) {
        setName(data.name);
        setClientName(data.client_name || "");
        setPrice(data.price.toString());
        setDeadline(data.deadline ? new Date(data.deadline).toISOString().split('T')[0] : "");
        setIsRetainer(data.is_retainer || false);
      }
      setLoading(false);
    };

    fetchProject();
  }, [id, user?.id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !price) {
      return;
    }

    const projectData = {
      name,
      client_name: clientName || null,
      price: parseFloat(price),
      deadline: isRetainer ? null : (deadline ? new Date(deadline).toISOString() : null),
      is_retainer: isRetainer,
    };

    await supabase
      .from("projects")
      .update(projectData)
      .eq("id", id);
      
    navigate('/projects');
  };

  if (loading) {
    return <div className="min-h-screen bg-background p-4 sm:p-6">טוען...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/projects')}
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">ערוך פרויקט</h1>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base">שם הפרויקט *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="לדוגמה: עיצוב לוגו"
                required
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientName" className="text-base">שם הלקוח</Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="לדוגמה: חברת ABC"
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="text-base">מחיר *</Label>
              <Input
                id="price"
                type="number"
                inputMode="numeric"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                required
                className="text-base"
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="isRetainer"
                checked={isRetainer}
                onCheckedChange={(checked) => setIsRetainer(checked as boolean)}
              />
              <Label htmlFor="isRetainer" className="text-base cursor-pointer">
                פרויקט חוזר (Retainer)
              </Label>
            </div>

            {!isRetainer && (
              <div className="space-y-2">
                <Label htmlFor="deadline" className="text-base">תאריך הגשה</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="text-base"
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/projects')}
                className="flex-1"
              >
                ביטול
              </Button>
              <Button type="submit" className="flex-1">
                שמור שינויים
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
