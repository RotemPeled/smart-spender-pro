import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Transaction } from "@/types";
import { format } from "date-fns";
import { he } from "date-fns/locale";

interface FinanceChartProps {
  transactions: Transaction[];
}

export const FinanceChart = ({ transactions }: FinanceChartProps) => {
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

  const chartData = Object.values(monthlyData);

  return (
    <Card className="p-6 shadow-elevation col-span-full">
      <h2 className="text-xl font-bold text-foreground mb-4">סקירה חודשית</h2>
      {chartData.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          עדיין אין נתונים להצגה. הוסף תנועות כדי לראות את התרשים!
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend />
            <Bar dataKey="income" fill="hsl(var(--success))" radius={[8, 8, 0, 0]} name="הכנסות" />
            <Bar dataKey="expenses" fill="hsl(var(--destructive))" radius={[8, 8, 0, 0]} name="הוצאות" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};
