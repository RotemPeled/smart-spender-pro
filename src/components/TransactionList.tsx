import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, Calendar } from "lucide-react";
import { Transaction } from "@/types";
import { format } from "date-fns";
import { he } from "date-fns/locale/he";

interface TransactionListProps {
  transactions: Transaction[];
}

export const TransactionList = ({ transactions }: TransactionListProps) => {
  return (
    <Card className="p-6 shadow-elevation">
      <h2 className="text-xl font-bold text-foreground mb-4">תנועות אחרונות</h2>
      <div className="space-y-3">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            עדיין אין תנועות. הוסף הכנסה או הוצאה כדי להתחיל!
          </div>
        ) : (
          transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-smooth"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === "income"
                      ? "bg-success/10"
                      : "bg-destructive/10"
                  }`}
                >
                  {transaction.type === "income" ? (
                    <ArrowUpRight className="w-5 h-5 text-success" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5 text-destructive" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{transaction.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {transaction.category}
                    </Badge>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {typeof transaction.date === 'string' 
                        ? format(new Date(transaction.date), "dd MMM, yyyy", { locale: he })
                        : format(transaction.date, "dd MMM, yyyy", { locale: he })}
                    </span>
                  </div>
                </div>
              </div>
              <div
                className={`text-lg font-bold ${
                  transaction.type === "income" ? "text-success" : "text-destructive"
                }`}
              >
                {transaction.type === "income" ? "+" : "-"}₪{Number(transaction.amount).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
