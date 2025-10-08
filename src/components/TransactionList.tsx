import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, Calendar, Trash2 } from "lucide-react";
import { Transaction } from "@/types";
import { format } from "date-fns";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TransactionListProps {
  transactions: Transaction[];
  onDelete?: (id: string) => void;
}

export const TransactionList = ({ transactions, onDelete }: TransactionListProps) => {
  return (
    <Card className="p-4 sm:p-6 shadow-elevation">
      <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4">עסקאות אחרונות</h2>
      <div className="space-y-2 sm:space-y-3">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-3 sm:p-4 rounded-lg border border-border hover:bg-accent/50 transition-smooth gap-2"
          >
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  transaction.type === "income"
                    ? "bg-success/10"
                    : "bg-destructive/10"
                }`}
              >
                {transaction.type === "income" ? (
                  <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground text-sm sm:text-base truncate">{transaction.description}</p>
                <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {transaction.category}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {typeof transaction.date === 'string' ? format(new Date(transaction.date), "MMM dd", { locale: he }) : format(transaction.date, "MMM dd", { locale: he })}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div
                className={`text-base sm:text-lg font-bold whitespace-nowrap ${
                  transaction.type === "income" ? "text-success" : "text-destructive"
                }`}
              >
                {transaction.type === "income" ? "+" : "-"}₪{transaction.amount.toLocaleString()}
              </div>
              {onDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-destructive" />
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
