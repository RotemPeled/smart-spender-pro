import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Calendar, Trash2, Circle, CheckCircle2, Edit2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AddProjectDrawer from "@/components/AddProjectDrawer";
import QuickActionFab from "@/components/QuickActionFab";

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

export default function Projects() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [showEditDrawer, setShowEditDrawer] = useState(false);
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

  const handleUpdateProject = async (projectId: string, projectData: any) => {
    console.log("Updating project:", projectId, "with data:", projectData);
    
    const { error } = await supabase
      .from("projects")
      .update(projectData)
      .eq("id", projectId);
    
    if (error) {
      console.error("Update error:", error);
      return;
    }
    
    await fetchProjects();
  };

  const handleDeleteProject = async (projectId: string) => {
    await supabase.from("projects").delete().eq("id", projectId);
    fetchProjects();
  };

  const handleEditProject = (project: any) => {
    setEditingProject(project);
    setShowEditDrawer(true);
  };

  const handleProjectUpdated = () => {
    fetchProjects();
    setEditingProject(null);
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

  const togglePaymentStatus = (project: any) => {
    const newStatus = project.payment_status === "paid" ? "unpaid" : "paid";
    handleUpdateProject(project.id, { payment_status: newStatus });
  };

  const filteredProjects = projects.filter((project) => {
    if (filter === "all") return true;
    if (filter === "active") return project.work_status === "in_progress";
    if (filter === "unpaid") return project.payment_status === "unpaid";
    if (filter === "completed-unpaid") return (project.work_status === "ready" || project.work_status === "completed") && project.payment_status !== "paid";
    return true;
  });

  return (
    <div className="space-y-6 sm:space-y-10 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">פרויקטים</h1>
          <p className="text-base text-muted-foreground mt-2">נהל את כל פרויקטי הלקוחות שלך</p>
        </div>
        <Button onClick={() => navigate('/projects/add')} className="shadow-sm hover:shadow-elevation transition-all duration-200">
          <Plus className="w-4 h-4 ml-2" />
          הוסף פרויקט
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
          className="rounded-full px-5 transition-all duration-200"
        >
          הכל
        </Button>
        <Button
          variant={filter === "active" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("active")}
          className="rounded-full px-5 transition-all duration-200"
        >
          פעילים
        </Button>
        <Button
          variant={filter === "unpaid" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("unpaid")}
          className="rounded-full px-5 transition-all duration-200"
        >
          לא שולם
        </Button>
        <Button
          variant={filter === "completed-unpaid" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("completed-unpaid")}
          className="rounded-full px-5 transition-all duration-200"
        >
          הושלם ולא שולם
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-4 sm:gap-5">
        {filteredProjects.length === 0 ? (
          <Card className="p-12 sm:p-16 text-center shadow-elevation rounded-2xl border border-border/50">
            <div className="max-w-md mx-auto space-y-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <Plus className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">אין פרויקטים בקטגוריה זו</h3>
                <p className="text-base text-muted-foreground mt-2">
                  השתמש בכפתור למעלה כדי להוסיף פרויקט חדש
                </p>
              </div>
            </div>
          </Card>
        ) : (
          filteredProjects.map((project) => (
            <Card key={project.id} className="p-6 sm:p-8 shadow-elevation hover:shadow-glow transition-all duration-300 rounded-2xl border border-border/50">
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4 sm:gap-5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWorkStatus(project);
                    }}
                    className="flex-shrink-0 hover:scale-105 transition-all duration-200 mt-1"
                    title={project.work_status === "in_progress" ? "לחץ כדי לסמן כמוכן" : "לחץ כדי לסמן כבתהליך"}
                  >
                    {project.work_status === "ready" || project.work_status === "completed" ? (
                      <CheckCircle2 className="w-8 h-8 sm:w-9 sm:h-9 text-primary" />
                    ) : (
                      <Circle className="w-8 h-8 sm:w-9 sm:h-9 text-muted-foreground" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 sm:gap-5">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg sm:text-xl font-semibold text-foreground truncate tracking-tight">{project.name}</h3>
                        <p className="text-sm sm:text-base text-muted-foreground mt-1.5">
                          {project.client_name || "ללא לקוח"}
                        </p>
                      </div>
                      <div className="text-left flex-shrink-0">
                        <div className="flex items-center gap-1 text-xl sm:text-2xl font-semibold text-foreground whitespace-nowrap">
                          ₪{Number(project.price).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    {project.description && (
                      <p className="text-sm sm:text-base text-muted-foreground mt-3 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 mt-4">
                      {project.deadline && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground px-3 py-1.5 rounded-full bg-accent/50">
                          <Calendar className="w-3.5 h-3.5" />
                          {format(new Date(project.deadline), "d MMM yyyy", { locale: he })}
                        </div>
                      )}

                      <Button
                        variant="secondary"
                        size="sm"
                        className={`h-8 px-4 text-sm rounded-full transition-all duration-200 ${project.payment_status === "paid" ? "bg-success/10 text-success hover:bg-success/20" : ""}`}
                        onClick={() => togglePaymentStatus(project)}
                      >
                        {project.payment_status === "paid" ? "שולם" : "לא שולם"}
                      </Button>

                      <div className="flex gap-2 mr-auto">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full hover:bg-accent/50"
                          onClick={() => handleEditProject(project)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-xl">האם אתה בטוח?</AlertDialogTitle>
                              <AlertDialogDescription className="text-base">
                                פעולה זו תמחק את הפרויקט לצמיתות ולא ניתן לבטל אותה.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="rounded-xl">ביטול</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteProject(project.id)} className="rounded-xl">
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

      {/* Edit Project Drawer */}
      <AddProjectDrawer
        open={showEditDrawer}
        onOpenChange={setShowEditDrawer}
        onProjectAdded={handleProjectUpdated}
        projectId={editingProject?.id}
        initialData={editingProject}
      />

      {/* Quick Action FAB */}
      <QuickActionFab onProjectAdded={fetchProjects} />
    </div>
  );
}
