import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, DollarSign, CheckCircle2, Circle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AddProjectDialog } from "@/components/AddProjectDialog";
import { format } from "date-fns";
import { he } from "date-fns/locale/he";

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user?.id)
      .eq("is_archived", false)
      .order("created_at", { ascending: false });

    setProjects(data || []);
  };

  const handleAddProject = async (projectData: any) => {
    await supabase.from("projects").insert([{ ...projectData, user_id: user?.id }]);
    fetchProjects();
  };

  const getStatusIcon = (workStatus: string) => {
    switch (workStatus) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case "ready":
        return <Circle className="w-5 h-5 text-primary" />;
      default:
        return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getPaymentBadge = (paymentStatus: string) => {
    const variants: Record<string, any> = {
      paid: { variant: "default", className: "bg-success" },
      unpaid: { variant: "secondary" },
      pending: { variant: "secondary", className: "bg-primary/20" },
    };
    return variants[paymentStatus] || variants.unpaid;
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      high: "bg-destructive",
      medium: "bg-primary",
      low: "bg-muted",
    };
    return colors[priority] || colors.medium;
  };

  const translateWorkStatus = (status: string) => {
    const translations: Record<string, string> = {
      in_progress: "בתהליך",
      ready: "מוכן",
      completed: "הושלם"
    };
    return translations[status] || status;
  };

  const translatePaymentStatus = (status: string) => {
    const translations: Record<string, string> = {
      paid: "שולם",
      unpaid: "לא שולם",
      pending: "ממתין"
    };
    return translations[status] || status;
  };

  const translatePriority = (priority: string) => {
    const translations: Record<string, string> = {
      high: "גבוהה",
      medium: "בינונית",
      low: "נמוכה"
    };
    return translations[priority] || priority;
  };

  const filteredProjects = projects.filter((project) => {
    if (filter === "all") return true;
    if (filter === "active") return project.work_status === "in_progress";
    if (filter === "unpaid") return project.payment_status === "unpaid";
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">פרויקטים</h1>
          <p className="text-muted-foreground mt-1">נהל את כל פרויקטי הלקוחות שלך</p>
        </div>
        <AddProjectDialog onAdd={handleAddProject} />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          הכל
        </Button>
        <Button
          variant={filter === "active" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("active")}
        >
          פעילים
        </Button>
        <Button
          variant={filter === "unpaid" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("unpaid")}
        >
          לא שולם
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-4">
        {filteredProjects.length === 0 ? (
          <Card className="p-12 text-center shadow-elevation">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">עדיין אין פרויקטים</h3>
                <p className="text-muted-foreground mt-1">
                  צור את הפרויקט הראשון שלך כדי להתחיל
                </p>
              </div>
              <AddProjectDialog onAdd={handleAddProject} />
            </div>
          </Card>
        ) : (
          filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="p-6 shadow-elevation hover:shadow-glow transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {getStatusIcon(project.work_status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{project.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {project.client_name || "אין לקוח"}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-2 text-xl font-bold text-foreground">
                          <DollarSign className="w-5 h-5 text-primary" />
                          ₪{Number(project.price).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    {project.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {project.deadline && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(project.deadline), "dd MMM, yyyy", { locale: he })}
                        </div>
                      )}
                      <Badge
                        variant={
                          project.work_status === "completed" ? "default" : "secondary"
                        }
                        className="text-xs"
                      >
                        {translateWorkStatus(project.work_status)}
                      </Badge>
                      <Badge
                        {...getPaymentBadge(project.payment_status)}
                        className="text-xs"
                      >
                        {translatePaymentStatus(project.payment_status)}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${getPriorityBadge(project.priority)}`}
                      >
                        עדיפות {translatePriority(project.priority)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
