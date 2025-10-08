import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, Briefcase, Calendar, AlertCircle, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { he } from "date-fns/locale/he";

export default function Dashboard() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [stats, setStats] = useState({
    totalIncome: 0,
    unpaidAmount: 0,
    activeProjects: 0,
  });
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, selectedMonth]);

  const fetchDashboardData = async () => {
    const monthStart = startOfMonth(new Date(selectedMonth));
    const monthEnd = endOfMonth(new Date(selectedMonth));

    // Fetch transactions for selected month
    const { data: transactions } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user?.id)
      .gte("date", monthStart.toISOString())
      .lte("date", monthEnd.toISOString());

    const income = transactions
      ?.filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    // Fetch projects
    const { data: projects } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user?.id)
      .eq("is_archived", false);

    const unpaid = projects
      ?.filter((p) => p.payment_status === "unpaid" || p.payment_status === "pending")
      .reduce((sum, p) => sum + Number(p.price), 0) || 0;

    const active = projects?.filter((p) => p.work_status === "in_progress").length || 0;

    // Get upcoming deadlines (next 7 days)
    const upcoming = projects
      ?.filter((p) => {
        if (!p.deadline) return false;
        const deadline = new Date(p.deadline);
        const now = new Date();
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(now.getDate() + 7);
        return deadline >= now && deadline <= sevenDaysFromNow;
      })
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 3) || [];

    setStats({ totalIncome: income, unpaidAmount: unpaid, activeProjects: active });
    setUpcomingDeadlines(upcoming);
  };

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return format(date, "yyyy-MM");
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">לוח בקרה</h1>
          <p className="text-muted-foreground mt-1">ברוך הבא! הנה הסקירה שלך.</p>
        </div>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            {monthOptions.map((month) => (
              <SelectItem key={month} value={month}>
                {format(new Date(month), "MMMM yyyy", { locale: he })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6 bg-gradient-card shadow-elevation hover:shadow-glow transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">סה״כ הכנסות</p>
              <p className="text-3xl font-bold text-success mt-2">
                ₪{stats.totalIncome.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">החודש</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card shadow-elevation hover:shadow-glow transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">סכום לא שולם</p>
              <p className="text-3xl font-bold text-primary mt-2">
                ₪{stats.unpaidAmount.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">תשלומים ממתינים</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card shadow-elevation hover:shadow-glow transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">פרויקטים פעילים</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {stats.activeProjects}
              </p>
              <p className="text-xs text-muted-foreground mt-1">בתהליך</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Upcoming Deadlines */}
      <Card className="p-6 shadow-elevation">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">דדליינים מתקרבים</h2>
          <Link to="/projects">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowRight className="w-4 h-4" />
              הצג הכל
            </Button>
          </Link>
        </div>
        {upcomingDeadlines.length > 0 ? (
          <div className="space-y-3">
            {upcomingDeadlines.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{project.name}</p>
                    <p className="text-sm text-muted-foreground">{project.client_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground font-medium">
                    {format(new Date(project.deadline), "dd MMM, yyyy", { locale: he })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            אין דדליינים מתקרבים ב-7 הימים הבאים
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card className="p-6 shadow-elevation">
        <h2 className="text-xl font-bold text-foreground mb-4">פעולות מהירות</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/projects">
            <Button className="gap-2">
              <Briefcase className="w-4 h-4" />
              נהל פרויקטים
            </Button>
          </Link>
          <Link to="/finance">
            <Button variant="outline" className="gap-2">
              <DollarSign className="w-4 h-4" />
              הצג דוח כספי מלא
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
