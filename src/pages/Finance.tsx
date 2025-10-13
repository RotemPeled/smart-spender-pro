import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, TrendingDown, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { he } from "date-fns/locale";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { TransactionList } from "@/components/TransactionList";
import { FinanceChart } from "@/components/FinanceChart";

export default function Finance() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [transactions, setTransactions] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
  });

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user, selectedMonth]);

  const fetchTransactions = async () => {
    const monthStart = startOfMonth(new Date(selectedMonth));
    const monthEnd = endOfMonth(new Date(selectedMonth));

    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user?.id)
      .gte("date", monthStart.toISOString())
      .lte("date", monthEnd.toISOString())
      .order("date", { ascending: false });

    const transactions = data || [];
    const transactionIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Fetch projects to include paid projects in income
    const { data: projects } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user?.id)
      .eq("is_archived", false);

    const paidProjectsIncome = projects
      ?.filter((p) => p.payment_status === "paid")
      .reduce((sum, p) => sum + Number(p.price), 0) || 0;

    const totalIncome = transactionIncome + paidProjectsIncome;

    setTransactions(transactions);
    setProjects(projects || []);
    setStats({
      totalIncome,
      totalExpenses: expenses,
      netProfit: totalIncome - expenses,
    });
  };

  const handleAddTransaction = async (transactionData: any) => {
    await supabase
      .from("transactions")
      .insert([{ ...transactionData, user_id: user?.id }]);
    fetchTransactions();
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    await supabase.from("transactions").delete().eq("id", transactionId);
    fetchTransactions();
  };

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return format(date, "yyyy-MM");
  });

  return (
    <div className="space-y-6 sm:space-y-10 animate-fade-in">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">כספים</h1>
          <p className="text-base text-muted-foreground mt-2">עקוב אחר ההכנסות וההוצאות שלך</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
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
          <AddTransactionDialog onAdd={handleAddTransaction} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2">
        <Card className="p-6 sm:p-8 bg-card shadow-elevation hover:shadow-glow transition-all duration-300 rounded-2xl border border-border/50">
          <div className="flex flex-col gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 sm:w-7 sm:h-7 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">סך הוצאות</p>
              <p className="text-3xl sm:text-4xl font-semibold text-destructive tracking-tight">
                ₪{stats.totalExpenses.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 sm:p-8 bg-card shadow-elevation hover:shadow-glow transition-all duration-300 rounded-2xl border border-border/50">
          <div className="flex flex-col gap-4">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center ${
              stats.netProfit >= 0 ? "bg-success/10" : "bg-destructive/10"
            }`}>
              <DollarSign className={`w-6 h-6 sm:w-7 sm:h-7 ${
                stats.netProfit >= 0 ? "text-success" : "text-destructive"
              }`} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">רווח נקי</p>
              <p
                className={`text-3xl sm:text-4xl font-semibold tracking-tight ${
                  stats.netProfit >= 0 ? "text-success" : "text-destructive"
                }`}
              >
                ₪{stats.netProfit.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Chart */}
      <FinanceChart transactions={transactions} projects={projects} />

      {/* Transactions List */}
      <TransactionList transactions={transactions} onDelete={handleDeleteTransaction} />

      {/* Bank API Placeholder */}
      <Card className="p-12 text-center shadow-elevation rounded-2xl border border-border/50">
        <div className="max-w-md mx-auto space-y-5">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Plus className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground tracking-tight">חבר חשבון בנק</h3>
            <p className="text-base text-muted-foreground mt-2">
              ייבא עסקאות אוטומטית מחשבון הבנק שלך (בקרוב)
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
