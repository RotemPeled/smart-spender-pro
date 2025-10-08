import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Transaction } from "./Dashboard";

interface FinanceChartProps {
  transactions: Transaction[];
}

export const FinanceChart = ({ transactions }: FinanceChartProps) => {
  const monthlyData = transactions.reduce((acc, transaction) => {
    const month = transaction.date.toLocaleDateString("en-US", { month: "short" });
    
    if (!acc[month]) {
      acc[month] = { month, income: 0, expenses: 0 };
    }
    
    if (transaction.type === "income") {
      acc[month].income += transaction.amount;
    } else {
      acc[month].expenses += transaction.amount;
    }
    
    return acc;
  }, {} as Record<string, { month: string; income: number; expenses: number }>);

  const chartData = Object.values(monthlyData);

  return (
    <Card className="p-6 shadow-elevation col-span-full">
      <h2 className="text-xl font-bold text-foreground mb-4">Monthly Overview</h2>
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
          <Bar dataKey="income" fill="hsl(var(--success))" radius={[8, 8, 0, 0]} />
          <Bar dataKey="expenses" fill="hsl(var(--destructive))" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};
