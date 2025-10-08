import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, Calendar, Trash2 } from "lucide-react";
import { Transaction } from "@/types";
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

interface TransactionListProps {
  transactions: Transaction[];
  onDelete?: (id: string) => void;
}

export const TransactionList = ({ transactions, onDelete }: TransactionListProps) => {
  return (
    <Card className="p-6 shadow-elevation">
      <h2 className="text-xl font-bold text-foreground mb-4">עסקאות אחרונות</h2>
      <div className="space-y-3">
        {transactions.map((transaction) => (
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
                    {typeof transaction.date === 'string' ? format(new Date(transaction.date), "MMM dd, yyyy") : format(transaction.date, "MMM dd, yyyy")}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`text-lg font-bold ${
                  transaction.type === "income" ? "text-success" : "text-destructive"
                }`}
              >
                {transaction.type === "income" ? "+" : "-"}₪{transaction.amount.toLocaleString()}
              </div>
              {onDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
                      <AlertDialogDescription>
                        פעולה זו תמחק את העסקה לצמיתות ולא ניתן לבטל אותה.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>ביטול</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(transaction.id)}>
                        מחק
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
