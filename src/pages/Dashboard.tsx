import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, Briefcase, Calendar, AlertCircle, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { he } from "date-fns/locale";
import { useIsMobile } from "@/hooks/use-mobile";
import QuickActionFab from "@/components/QuickActionFab";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [stats, setStats] = useState({
    netProfit: 0,
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

    const transactionIncome = transactions
      ?.filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    const transactionExpenses = transactions
      ?.filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    // Fetch projects
    const { data: projects } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user?.id)
      .eq("is_archived", false);

    // Add paid projects to income
    const paidProjectsIncome = projects
      ?.filter((p) => p.payment_status === "paid")
      .reduce((sum, p) => sum + Number(p.price), 0) || 0;

    const totalIncome = transactionIncome + paidProjectsIncome;
    const netProfit = totalIncome - transactionExpenses;

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

    setStats({ netProfit, unpaidAmount: unpaid, activeProjects: active });
    setUpcomingDeadlines(upcoming);
  };

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return format(date, "yyyy-MM");
  });

  return (
    <div className="space-y-6 sm:space-y-10 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">תקציר</h1>
          <p className="text-base text-muted-foreground mt-2">ברוך שובך! הנה סקירת המצב שלך.</p>
        </div>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((month) => (
              <SelectItem key={month} value={month}>
                {format(new Date(month), "MMMM yyyy", { locale: he })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className={`grid gap-5 ${isMobile ? 'grid-cols-2' : 'sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
        <Card 
          className="p-6 sm:p-8 bg-card shadow-elevation hover:shadow-glow transition-all duration-300 cursor-pointer rounded-2xl border border-border/50"
          onClick={() => navigate('/finance')}
        >
          <div className="flex flex-col gap-4">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center ${
              stats.netProfit >= 0 ? "bg-success/10" : "bg-destructive/10"
            }`}>
              <TrendingUp className={`w-6 h-6 sm:w-7 sm:h-7 ${
                stats.netProfit >= 0 ? "text-success" : "text-destructive"
              }`} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">רווח נקי</p>
              <p className={`text-3xl sm:text-4xl font-semibold tracking-tight ${
                stats.netProfit >= 0 ? "text-success" : "text-destructive"
              }`}>
                ₪{stats.netProfit.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground mt-1">החודש</p>
            </div>
          </div>
        </Card>

        <Card 
          className="p-6 sm:p-8 bg-card shadow-elevation hover:shadow-glow transition-all duration-300 cursor-pointer rounded-2xl border border-border/50"
          onClick={() => navigate('/projects?filter=completed-unpaid')}
        >
          <div className="flex flex-col gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">סכום לא משולם</p>
              <p className="text-3xl sm:text-4xl font-semibold text-primary tracking-tight">
                ₪{stats.unpaidAmount.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground mt-1">תשלומים ממתינים</p>
            </div>
          </div>
        </Card>

        <Card 
          className="p-6 sm:p-8 bg-card shadow-elevation hover:shadow-glow transition-all duration-300 cursor-pointer rounded-2xl border border-border/50"
          onClick={() => navigate('/projects?filter=active')}
        >
          <div className="flex flex-col gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Briefcase className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">פרויקטים פעילים</p>
              <p className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
                {stats.activeProjects}
              </p>
              <p className="text-sm text-muted-foreground mt-1">בתהליך</p>
            </div>
          </div>
        </Card>

        <Card 
          className="p-6 sm:p-8 bg-card shadow-elevation hover:shadow-glow transition-all duration-300 cursor-pointer rounded-2xl border border-border/50"
          onClick={() => navigate('/projects')}
        >
          <div className="flex flex-col gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">מועדי אספקה</p>
              <p className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
                {upcomingDeadlines.length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">קרובים</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Upcoming Deadlines - Only show on desktop */}
      {!isMobile && (
        <Card className="p-8 shadow-elevation rounded-2xl border border-border/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-foreground tracking-tight">מועדי אספקה קרובים</h2>
            <Link to="/projects">
              <Button variant="ghost" size="sm" className="gap-2 text-sm hover:bg-accent/50">
                הצג הכל
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          {upcomingDeadlines.length > 0 ? (
            <div className="space-y-2">
              {upcomingDeadlines.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-5 rounded-xl border border-border/50 hover:bg-accent/30 transition-all duration-200 gap-3"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-destructive" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground text-base truncate">{project.name}</p>
                      <p className="text-sm text-muted-foreground truncate mt-0.5">{project.client_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm flex-shrink-0">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground font-medium whitespace-nowrap">
                      {format(new Date(project.deadline), "d MMM", { locale: he })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-base text-muted-foreground">
              אין מועדי אספקה קרובים ב-7 הימים הקרובים
            </div>
          )}
        </Card>
      )}

      {/* Quick Action FAB */}
      <QuickActionFab />
    </div>
  );
}
