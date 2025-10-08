import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, DollarSign, Calendar } from "lucide-react";

export interface Project {
  id: string;
  name: string;
  description: string;
  price: number;
  date: Date;
  isDone: boolean;
  isPaid: boolean;
}

interface ProjectsListProps {
  projects: Project[];
}

export const ProjectsList = ({ projects }: ProjectsListProps) => {
  return (
    <Card className="p-6 shadow-elevation">
      <h2 className="text-xl font-bold text-foreground mb-4">פרויקטים</h2>
      <div className="space-y-3">
        {projects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            אין עדיין פרויקטים. הוסף את הפרויקט הראשון שלך כדי להתחיל!
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-smooth"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {project.isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{project.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {project.date.toLocaleDateString()}
                    </span>
                    <Badge
                      variant={project.isDone ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {project.isDone ? "הושלם" : "בתהליך"}
                    </Badge>
                    <Badge
                      variant={project.isPaid ? "default" : "secondary"}
                      className={`text-xs ${project.isPaid ? "bg-success" : ""}`}
                    >
                      {project.isPaid ? "שולם" : "לא שולם"}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-lg font-bold text-foreground">
                ₪{project.price.toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
