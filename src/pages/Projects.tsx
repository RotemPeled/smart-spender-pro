import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Trash2, ChevronDown } from "lucide-react";
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
  const [editingProject, setEditingProject] = useState<any>(null);
  const [swipedProject, setSwipedProject] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<number>(0);
  const [touchEnd, setTouchEnd] = useState<number>(0);

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
    console.log("Updating project:", projectId, "with data:", projectData);
    const { error } = await supabase
      .from("projects")
      .update(projectData)
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

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      high: "bg-destructive",
      medium: "bg-primary",
      low: "bg-muted",
    };
    return colors[priority] || colors.medium;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (projectId: string) => {
    if (touchStart - touchEnd < -75) {
      // Swiped right (left to right)
      setSwipedProject(projectId);
    }
    if (touchStart - touchEnd > 75) {
      // Swiped left - close
      setSwipedProject(null);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, projectId: string) => {
    e.preventDefault();
    setSwipedProject(swipedProject === projectId ? null : projectId);
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
            <div key={project.id} className="relative overflow-hidden">
              <Card
                className={`p-4 sm:p-6 shadow-elevation hover:shadow-glow transition-all cursor-pointer ${
                  swipedProject === project.id ? "translate-x-20" : ""
                }`}
                style={{ transition: "transform 0.3s ease" }}
                onClick={(e) => {
                  if (swipedProject === project.id) {
                    setSwipedProject(null);
                  } else {
                    setEditingProject(project);
                  }
                }}
                onContextMenu={(e) => handleContextMenu(e, project.id)}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={() => handleTouchEnd(project.id)}
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
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {project.deadline && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(project.deadline), "MMM dd, yyyy")}
                        </div>
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant={project.work_status === "completed" ? "default" : "secondary"}
                            size="sm"
                            className="h-6 px-2 text-xs gap-1"
                          >
                            {project.work_status === "completed" ? "הושלם" : project.work_status === "in_progress" ? "בתהליך" : "מוכן"}
                            <ChevronDown className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-background z-50">
                          <DropdownMenuItem onClick={() => handleUpdateProject(project.id, { work_status: "in_progress" })}>
                            בתהליך
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateProject(project.id, { work_status: "ready" })}>
                            מוכן
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateProject(project.id, { work_status: "completed" })}>
                            הושלם
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

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

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="secondary"
                            size="sm"
                            className={`h-6 px-2 text-xs gap-1 ${getPriorityBadge(project.priority)}`}
                          >
                            עדיפות {project.priority === "high" ? "גבוהה" : project.priority === "medium" ? "בינונית" : "נמוכה"}
                            <ChevronDown className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-background z-50">
                          <DropdownMenuItem onClick={() => handleUpdateProject(project.id, { priority: "low" })}>
                            נמוכה
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateProject(project.id, { priority: "medium" })}>
                            בינונית
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateProject(project.id, { priority: "high" })}>
                            גבוהה
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            {swipedProject === project.id && (
              <div className="absolute left-0 top-0 bottom-0 w-20 flex items-center justify-center animate-fade-in">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-full w-20 rounded-none"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                      <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
                      <AlertDialogDescription>
                        פעולה זו תמחק את הפרויקט לצמיתות ולא ניתן לבטל אותה.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setSwipedProject(null)}>ביטול</AlertDialogCancel>
                      <AlertDialogAction onClick={() => {
                        handleDeleteProject(project.id);
                        setSwipedProject(null);
                      }}>
                        מחק
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
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
