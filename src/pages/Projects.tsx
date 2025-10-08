import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Calendar, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AddProjectDialog } from "@/components/AddProjectDialog";
import { EditProjectDialog } from "@/components/EditProjectDialog";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

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

  const handleUpdateProject = async (projectId: string, projectData: any) => {
    await supabase.from("projects").update(projectData).eq("id", projectId);
    fetchProjects();
  };

  const handleDeleteProject = async (projectId: string) => {
    await supabase.from("projects").delete().eq("id", projectId);
    toast({
      title: "הפרויקט נמחק בהצלחה",
    });
    fetchProjects();
  };

  const filteredProjects = projects.filter((project) => {
    if (filter === "all") return true;
    if (filter === "active") return project.work_status === "in_progress";
    if (filter === "unpaid") return project.payment_status === "unpaid";
    return true;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">פרויקטים</h1>
          <p className="text-sm text-muted-foreground mt-1">נהל את כל פרויקטי הלקוחות שלך</p>
        </div>
        <AddProjectDialog onAdd={handleAddProject} />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
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
      <div className="grid gap-3 sm:gap-4">
        {filteredProjects.length === 0 ? (
          <Card className="p-6 sm:p-12 text-center shadow-elevation">
            <div className="max-w-md mx-auto space-y-3 sm:space-y-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground">אין עדיין פרויקטים</h3>
                <p className="text-sm text-muted-foreground mt-1">
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
              className="p-4 sm:p-6 shadow-elevation hover:shadow-glow transition-all"
            >
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 sm:gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-bold text-foreground truncate">{project.name}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          {project.client_name || "ללא לקוח"}
                        </p>
                      </div>
                      <div className="text-left flex-shrink-0">
                        <div className="flex items-center gap-1 text-lg sm:text-xl font-bold text-foreground whitespace-nowrap">
                          ₪{Number(project.price).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    {project.description && (
                      <p className="text-xs sm:text-sm text-muted-foreground mt-2 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                    {project.deadline && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(project.deadline), "MMM dd, yyyy")}
                      </div>
                    )}
                    
                    <div className="mt-3 space-y-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">סטטוס עבודה:</span>
                        <Button
                          variant={project.work_status === "in_progress" ? "default" : "outline"}
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => handleUpdateProject(project.id, { work_status: "in_progress" })}
                        >
                          בתהליך
                        </Button>
                        <Button
                          variant={project.work_status === "ready" ? "default" : "outline"}
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => handleUpdateProject(project.id, { work_status: "ready" })}
                        >
                          מוכן
                        </Button>
                        <Button
                          variant={project.work_status === "completed" ? "default" : "outline"}
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => handleUpdateProject(project.id, { work_status: "completed" })}
                        >
                          הושלם
                        </Button>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">תשלום:</span>
                        <Button
                          variant={project.payment_status === "unpaid" ? "default" : "outline"}
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => handleUpdateProject(project.id, { payment_status: "unpaid" })}
                        >
                          לא שולם
                        </Button>
                        <Button
                          variant={project.payment_status === "pending" ? "default" : "outline"}
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => handleUpdateProject(project.id, { payment_status: "pending" })}
                        >
                          ממתין
                        </Button>
                        <Button
                          variant={project.payment_status === "paid" ? "default" : "outline"}
                          size="sm"
                          className="h-6 px-2 text-xs bg-success hover:bg-success/90"
                          onClick={() => handleUpdateProject(project.id, { payment_status: "paid" })}
                        >
                          שולם
                        </Button>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">עדיפות:</span>
                        <Button
                          variant={project.priority === "low" ? "default" : "outline"}
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => handleUpdateProject(project.id, { priority: "low" })}
                        >
                          נמוכה
                        </Button>
                        <Button
                          variant={project.priority === "medium" ? "default" : "outline"}
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => handleUpdateProject(project.id, { priority: "medium" })}
                        >
                          בינונית
                        </Button>
                        <Button
                          variant={project.priority === "high" ? "default" : "outline"}
                          size="sm"
                          className="h-6 px-2 text-xs bg-destructive hover:bg-destructive/90"
                          onClick={() => handleUpdateProject(project.id, { priority: "high" })}
                        >
                          גבוהה
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <EditProjectDialog project={project} onUpdate={handleUpdateProject} />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4 ml-2" />
                            מחק
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
                            <AlertDialogDescription>
                              פעולה זו תמחק את הפרויקט לצמיתות ולא ניתן לבטל אותה.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>ביטול</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteProject(project.id)}>
                              מחק
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
