import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Transaction, Project } from "@/types";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { TrendingUp, TrendingDown } from "lucide-react";

interface FinanceChartProps {
  transactions: Transaction[];
  projects?: Project[];
}

export const FinanceChart = ({ transactions, projects = [] }: FinanceChartProps) => {
  const monthlyData = transactions.reduce((acc, transaction) => {
    const transactionDate = typeof transaction.date === 'string' ? new Date(transaction.date) : transaction.date;
    const month = format(transactionDate, "MMM", { locale: he });
    
    if (!acc[month]) {
      acc[month] = { month, income: 0, expenses: 0 };
    }
    
    if (transaction.type === "income") {
      acc[month].income += Number(transaction.amount);
    } else {
      acc[month].expenses += Number(transaction.amount);
    }
    
    return acc;
  }, {} as Record<string, { month: string; income: number; expenses: number }>);

  // Add paid projects to income
  projects
    .filter((p) => p.payment_status === "paid" && p.deadline)
    .forEach((project) => {
      const projectDate = new Date(project.deadline!);
      const month = format(projectDate, "MMM", { locale: he });
      
      if (!monthlyData[month]) {
        monthlyData[month] = { month, income: 0, expenses: 0 };
      }
      
      monthlyData[month].income += Number(project.price);
    });

  const chartData = Object.values(monthlyData);

  const totalIncome = chartData.reduce((sum, item) => sum + item.income, 0);
  const totalExpenses = chartData.reduce((sum, item) => sum + item.expenses, 0);
  const netBalance = totalIncome - totalExpenses;

  return (
    <Card className="p-6 sm:p-8 shadow-elevation rounded-2xl border border-border/50 transition-all duration-300">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight mb-4">סקירה פינסית</h2>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="bg-success/5 rounded-xl p-3 sm:p-4 border border-success/10">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-success"></div>
              <p className="text-xs sm:text-sm text-muted-foreground">הכנסות</p>
            </div>
            <p className="text-lg sm:text-xl font-semibold text-success">
              ₪{totalIncome.toLocaleString()}
            </p>
          </div>
          
          <div className="bg-destructive/5 rounded-xl p-3 sm:p-4 border border-destructive/10">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-destructive"></div>
              <p className="text-xs sm:text-sm text-muted-foreground">הוצאות</p>
            </div>
            <p className="text-lg sm:text-xl font-semibold text-destructive">
              ₪{totalExpenses.toLocaleString()}
            </p>
          </div>
          
          <div className={`rounded-xl p-3 sm:p-4 border ${netBalance >= 0 ? 'bg-primary/5 border-primary/10' : 'bg-destructive/5 border-destructive/10'}`}>
            <div className="flex items-center gap-2 mb-1">
              {netBalance >= 0 ? (
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
              ) : (
                <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-destructive" />
              )}
              <p className="text-xs sm:text-sm text-muted-foreground">יתרה</p>
            </div>
            <p className={`text-lg sm:text-xl font-semibold ${netBalance >= 0 ? 'text-primary' : 'text-destructive'}`}>
              ₪{netBalance.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-accent/20 rounded-xl p-4 sm:p-5">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart 
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.9} />
                <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0.6} />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity={0.9} />
                <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))" 
              opacity={0.3}
              vertical={false}
            />
            <XAxis 
              dataKey="month" 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              axisLine={{ stroke: "hsl(var(--border))", opacity: 0.3 }}
              tickLine={false}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              tick={false}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--accent))", opacity: 0.1 }}
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                padding: "12px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              }}
              labelStyle={{ 
                color: "hsl(var(--foreground))", 
                fontWeight: 600,
                marginBottom: "8px"
              }}
              itemStyle={{ 
                color: "hsl(var(--foreground))",
                padding: "4px 0"
              }}
              formatter={(value: number, name: string) => {
                const label = name === "income" ? "הכנסות" : "הוצאות";
                return [`₪${value.toLocaleString()}`, label];
              }}
            />
            <Bar 
              dataKey="income" 
              fill="url(#incomeGradient)"
              radius={[12, 12, 0, 0]} 
              maxBarSize={50}
              animationDuration={800}
              animationEasing="ease-in-out"
            />
            <Bar 
              dataKey="expenses" 
              fill="url(#expenseGradient)"
              radius={[12, 12, 0, 0]} 
              maxBarSize={50}
              animationDuration={800}
              animationEasing="ease-in-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
