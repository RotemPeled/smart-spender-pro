import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Trash2, ChevronDown, Circle, CheckCircle2, Edit2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AddProjectDialog } from "@/components/AddProjectDialog";
import { EditProjectDialog } from "@/components/EditProjectDialog";
import { format } from "date-fns";
import { he } from "date-fns/locale";
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
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [editingProject, setEditingProject] = useState<any>(null);

  useEffect(() => {
    const urlFilter = searchParams.get('filter');
    if (urlFilter) {
      setFilter(urlFilter);
    }
  }, [searchParams]);

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

    if (data) {
      // Sort by deadline - most urgent first
      const sortedData = [...data].sort((a, b) => {
        const now = new Date();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        const deadlineA = a.deadline ? new Date(a.deadline) : endOfMonth;
        const deadlineB = b.deadline ? new Date(b.deadline) : endOfMonth;
        
        return deadlineA.getTime() - deadlineB.getTime();
      });
      setProjects(sortedData);
    } else {
      setProjects([]);
    }
  };

  const handleAddProject = async (projectData: any) => {
    await supabase.from("projects").insert([{ ...projectData, user_id: user?.id }]);
    fetchProjects();
  };

  const handleUpdateProject = async (projectId: string, projectData: any) => {
    console.log("Updating project:", projectId, "with data:", projectData);
    
    // If payment_status is being set to "paid", automatically set work_status to "completed"
    const updateData = { ...projectData };
    if (updateData.payment_status === "paid") {
      updateData.work_status = "completed";
    }
    
    const { error } = await supabase
      .from("projects")
      .update(updateData)
      .eq("id", projectId);
    
    if (error) {
      console.error("Update error:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לעדכן את הפרויקט",
        variant: "destructive",
      });
      return;
    }
    
    await fetchProjects();
    toast({
      title: "הצלחה",
      description: "הפרויקט עודכן בהצלחה",
    });
  };

  const handleDeleteProject = async (projectId: string) => {
    await supabase.from("projects").delete().eq("id", projectId);
    toast({
      title: "הפרויקט נמחק בהצלחה",
    });
    fetchProjects();
  };

  const getPaymentBadge = (paymentStatus: string) => {
    const variants: Record<string, any> = {
      paid: { variant: "default", className: "bg-success" },
      unpaid: { variant: "secondary" },
      pending: { variant: "secondary", className: "bg-primary/20" },
    };
    return variants[paymentStatus] || variants.unpaid;
  };

  const toggleWorkStatus = (project: any) => {
    const newStatus = project.work_status === "in_progress" ? "ready" : "in_progress";
    handleUpdateProject(project.id, { work_status: newStatus });
  };

  const filteredProjects = projects.filter((project) => {
    if (filter === "all") return true;
    if (filter === "active") return project.work_status === "in_progress";
    if (filter === "unpaid") return project.payment_status === "unpaid";
    if (filter === "completed-unpaid") return project.work_status === "completed" && project.payment_status !== "paid";
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
        <Button
          variant={filter === "completed-unpaid" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("completed-unpaid")}
        >
          הושלם ולא שולם
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
            <Card key={project.id} className="p-4 sm:p-6 shadow-elevation hover:shadow-glow transition-all">
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
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {project.deadline && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(project.deadline), "d MMM yyyy", { locale: he })}
                        </div>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWorkStatus(project);
                        }}
                        className="flex items-center gap-1 text-xs hover:scale-110 transition-transform"
                        title={project.work_status === "in_progress" ? "לחץ כדי לסמן כמוכן" : "לחץ כדי לסמן כבתהליך"}
                      >
                        {project.work_status === "completed" ? (
                          <CheckCircle2 className="w-5 h-5 text-success fill-success" />
                        ) : project.work_status === "ready" ? (
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="secondary"
                            size="sm"
                            className={`h-6 px-2 text-xs gap-1 ${project.payment_status === "paid" ? "bg-success hover:bg-success/90" : ""}`}
                          >
                            {project.payment_status === "paid" ? "שולם" : project.payment_status === "pending" ? "ממתין" : "לא שולם"}
                            <ChevronDown className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-background z-50">
                          <DropdownMenuItem onClick={() => handleUpdateProject(project.id, { payment_status: "unpaid" })}>
                            לא שולם
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateProject(project.id, { payment_status: "pending" })}>
                            ממתין
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateProject(project.id, { payment_status: "paid" })}>
                            שולם
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <div className="flex gap-1 mr-auto">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => setEditingProject(project)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
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
              </div>
            </Card>
          ))
        )}
      </div>
      
      {editingProject && (
        <EditProjectDialog
          project={editingProject}
          onUpdate={handleUpdateProject}
          open={!!editingProject}
          onOpenChange={(open) => !open && setEditingProject(null)}
        />
      )}
    </div>
  );
}
