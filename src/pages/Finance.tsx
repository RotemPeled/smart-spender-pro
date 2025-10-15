import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format, startOfMonth, endOfMonth } from "date-fns";
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
} from "@/components/ui/alert-dialog";

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
    const { error } = await supabase
      .from("transactions")
      .insert([{ ...transactionData, user_id: user?.id }]);
    
    if (!error) {
      fetchTransactions();
    }
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  const handleDeleteTransaction = async (transactionId: string) => {
    await supabase.from("transactions").delete().eq("id", transactionId);
    setDeleteDialogOpen(false);
    setTransactionToDelete(null);
    fetchTransactions();
  };

  const openDeleteDialog = (transactionId: string) => {
    setTransactionToDelete(transactionId);
    setDeleteDialogOpen(true);
  };

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return format(date, "yyyy-MM");
  });

  const expenseTransactions = transactions.filter(t => t.type === "expense");

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-24">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">כספים</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full sm:w-[180px] h-11 rounded-xl">
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
      </div>

      {/* Stats Cards - Apple Style Square Cards */}
      <div className="grid gap-4 sm:gap-5 grid-cols-2">
        {/* Total Income Card */}
        <Card className="p-6 sm:p-8 bg-white dark:bg-card transition-all duration-300 ease-in-out hover:shadow-lg rounded-[24px] border-0 shadow-[0_2px_12px_rgba(0,0,0,0.08)] aspect-square flex flex-col justify-center">
          <div className="flex flex-col gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#007AFF]/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5" style={{ color: '#007AFF' }} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-medium text-muted-foreground mb-2">סך הכנסות</h3>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight" style={{ color: '#007AFF' }}>
                ₪{stats.totalIncome.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        {/* Total Expenses Card */}
        <Card className="p-6 sm:p-8 bg-white dark:bg-card transition-all duration-300 ease-in-out hover:shadow-lg rounded-[24px] border-0 shadow-[0_2px_12px_rgba(0,0,0,0.08)] aspect-square flex flex-col justify-center">
          <div className="flex flex-col gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FF3B30]/10 flex items-center justify-center flex-shrink-0">
              <TrendingDown className="w-5 h-5" style={{ color: '#FF3B30' }} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-medium text-muted-foreground mb-2">סך הוצאות</h3>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight" style={{ color: '#FF3B30' }}>
                ₪{stats.totalExpenses.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Expenses List - Apple Style */}
      <Card className="bg-white dark:bg-card rounded-[24px] border-0 shadow-[0_2px_12px_rgba(0,0,0,0.08)] overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-border/30">
          <h2 className="text-lg font-semibold text-foreground">הוצאות אחרונות</h2>
        </div>
        
        {expenseTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">אין הוצאות לחודש זה</p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {expenseTransactions.map((transaction, index) => (
              <div
                key={transaction.id}
                className="p-4 sm:p-5 flex items-center gap-4 hover:bg-muted/30 transition-colors duration-200 animate-fade-in group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Expense Icon */}
                <div className="w-10 h-10 rounded-full bg-[#FF3B30]/10 flex items-center justify-center flex-shrink-0">
                  <TrendingDown className="w-5 h-5" style={{ color: '#FF3B30' }} strokeWidth={2} />
                </div>

                {/* Expense Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium text-foreground truncate">
                    {transaction.description || transaction.category}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(transaction.date), "d MMMM yyyy", { locale: he })}
                  </p>
                </div>

                {/* Amount and Delete */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <p className="text-lg font-semibold" style={{ color: '#FF3B30' }}>
                    ₪{Number(transaction.amount).toLocaleString()}
                  </p>
                  <button
                    onClick={() => openDeleteDialog(transaction.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 hover:bg-destructive/10 rounded-lg"
                    aria-label="מחק הוצאה"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>מחק הוצאה</AlertDialogTitle>
            <AlertDialogDescription>
              האם אתה בטוח שברצונך למחוק הוצאה זו? פעולה זו לא ניתנת לביטול.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">ביטול</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => transactionToDelete && handleDeleteTransaction(transactionToDelete)}
              className="rounded-xl bg-destructive hover:bg-destructive/90"
            >
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
